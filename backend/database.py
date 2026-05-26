import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .seed_data import SEED_PRODUCTS

DB_PATH = Path(__file__).with_name("shop.db")


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                line TEXT NOT NULL,
                price INTEGER NOT NULL,
                old_price INTEGER,
                rating REAL NOT NULL DEFAULT 0,
                popular INTEGER NOT NULL DEFAULT 0,
                is_new INTEGER NOT NULL DEFAULT 0,
                in_stock INTEGER NOT NULL DEFAULT 1,
                sale INTEGER NOT NULL DEFAULT 0,
                art TEXT NOT NULL,
                image_src TEXT,
                image_alt TEXT,
                specs TEXT NOT NULL DEFAULT '[]',
                tags TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT NOT NULL UNIQUE,
                customer_name TEXT NOT NULL,
                customer_email TEXT,
                customer_phone TEXT NOT NULL,
                preferred_contact TEXT NOT NULL,
                delivery_method TEXT NOT NULL,
                delivery_address TEXT NOT NULL,
                total INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                price INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY(product_id) REFERENCES products(id)
            );
            """
        )
        count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if count == 0:
            seed_products(connection)


def seed_products(connection: sqlite3.Connection) -> None:
    now = utc_now()
    for product in SEED_PRODUCTS:
        image = product.get("image") or {}
        connection.execute(
            """
            INSERT INTO products (
                id, name, category, line, price, old_price, rating, popular,
                is_new, in_stock, sale, art, image_src, image_alt, specs, tags, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["id"],
                product["name"],
                product["category"],
                product["line"],
                product["price"],
                product.get("oldPrice"),
                product["rating"],
                product["popular"],
                int(product["isNew"]),
                int(product["inStock"]),
                int(product["sale"]),
                product["art"],
                image.get("src"),
                image.get("alt"),
                json.dumps(product.get("specs", []), ensure_ascii=False),
                json.dumps(product.get("tags", []), ensure_ascii=False),
                now,
            ),
        )


def list_products() -> list[dict]:
    with connect() as connection:
        rows = connection.execute(
            "SELECT * FROM products ORDER BY popular DESC, id ASC"
        ).fetchall()
    return [product_from_row(row) for row in rows]


def get_product(product_id: int) -> dict | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT * FROM products WHERE id = ?",
            (product_id,),
        ).fetchone()
    return product_from_row(row) if row else None


def create_order(payload: dict) -> dict:
    customer = payload["customer"]
    delivery = payload["delivery"]
    incoming_items = payload.get("items", [])

    if not incoming_items:
        raise ValueError("Корзина пуста")

    with connect() as connection:
        resolved_items = []
        total = 0

        for incoming in incoming_items:
            quantity = max(0, int(incoming.get("quantity", 0)))
            if quantity == 0:
                continue

            product = connection.execute(
                "SELECT id, name, price, in_stock FROM products WHERE id = ?",
                (incoming["id"],),
            ).fetchone()

            if not product:
                raise ValueError(f"Товар с id {incoming['id']} не найден")

            if not bool(product["in_stock"]):
                raise ValueError(f"Товар {product['name']} сейчас недоступен")

            item_total = product["price"] * quantity
            total += item_total
            resolved_items.append(
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "price": product["price"],
                    "quantity": quantity,
                }
            )

        if not resolved_items:
            raise ValueError("Корзина пуста")

        order_number = make_order_number()
        created_at = utc_now()
        cursor = connection.execute(
            """
            INSERT INTO orders (
                order_number, customer_name, customer_email, customer_phone,
                preferred_contact, delivery_method, delivery_address, total, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order_number,
                customer["name"],
                customer.get("email") or "",
                customer["phone"],
                customer["preferredContact"],
                delivery["method"],
                delivery["address"],
                total,
                "new",
                created_at,
            ),
        )
        order_id = cursor.lastrowid

        for item in resolved_items:
            connection.execute(
                """
                INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    order_id,
                    item["product_id"],
                    item["product_name"],
                    item["price"],
                    item["quantity"],
                ),
            )

    return {
        "id": order_id,
        "orderNumber": order_number,
        "status": "new",
        "total": total,
        "createdAt": created_at,
        "customer": customer,
        "delivery": delivery,
        "items": [
            {
                "id": item["product_id"],
                "name": item["product_name"],
                "price": item["price"],
                "quantity": item["quantity"],
            }
            for item in resolved_items
        ],
    }


def list_orders() -> list[dict]:
    with connect() as connection:
        orders = connection.execute(
            "SELECT * FROM orders ORDER BY id DESC"
        ).fetchall()
        items = connection.execute(
            "SELECT * FROM order_items ORDER BY id ASC"
        ).fetchall()

    items_by_order: dict[int, list[dict]] = {}
    for item in items:
        items_by_order.setdefault(item["order_id"], []).append(
            {
                "productId": item["product_id"],
                "name": item["product_name"],
                "price": item["price"],
                "quantity": item["quantity"],
            }
        )

    return [
        {
            "id": order["id"],
            "orderNumber": order["order_number"],
            "status": order["status"],
            "total": order["total"],
            "createdAt": order["created_at"],
            "customer": {
                "name": order["customer_name"],
                "email": order["customer_email"],
                "phone": order["customer_phone"],
                "preferredContact": order["preferred_contact"],
            },
            "delivery": {
                "method": order["delivery_method"],
                "address": order["delivery_address"],
            },
            "items": items_by_order.get(order["id"], []),
        }
        for order in orders
    ]


def update_order_status(order_id: int, status: str) -> dict | None:
    with connect() as connection:
        cursor = connection.execute(
            "UPDATE orders SET status = ? WHERE id = ?",
            (status, order_id),
        )
        if cursor.rowcount == 0:
            return None
    return {"id": order_id, "status": status}


def product_from_row(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "line": row["line"],
        "price": row["price"],
        "oldPrice": row["old_price"],
        "rating": row["rating"],
        "popular": row["popular"],
        "isNew": bool(row["is_new"]),
        "inStock": bool(row["in_stock"]),
        "sale": bool(row["sale"]),
        "art": row["art"],
        "image": {
            "src": row["image_src"],
            "alt": row["image_alt"],
        }
        if row["image_src"]
        else None,
        "specs": json.loads(row["specs"]),
        "tags": json.loads(row["tags"]),
    }


def make_order_number() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    return f"ML-{stamp[-10:]}"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

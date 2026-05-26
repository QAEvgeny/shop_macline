from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import database
from .schemas import OrderCreate, OrderCreated, ProductOut, StatusUpdate
from .services.notifications import notify_order

PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATIC_FILES = {"index.html", "styles.css", "app.js", "api.js", "config.js"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield


app = FastAPI(
    title="MacLine API",
    description="Backend для интернет-магазина MacLine на FastAPI + SQLite.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/products", response_model=list[ProductOut])
def products() -> list[dict]:
    return database.list_products()


@app.get("/api/products/{product_id}", response_model=ProductOut)
def product(product_id: int) -> dict:
    item = database.get_product(product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return item


@app.post("/api/orders", response_model=OrderCreated, status_code=201)
def create_order(order: OrderCreate) -> dict:
    try:
        saved_order = database.create_order(order.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    try:
        delivery = notify_order(saved_order)
    except Exception as error:
        print(f"Order {saved_order['orderNumber']} notification failed: {error}")
        delivery = "backend"

    return {
        "orderNumber": saved_order["orderNumber"],
        "status": saved_order["status"],
        "delivery": delivery,
        "total": saved_order["total"],
    }


@app.get("/api/admin/orders")
def admin_orders() -> list[dict]:
    return database.list_orders()


@app.patch("/api/admin/orders/{order_id}/status")
def update_order_status(order_id: int, payload: StatusUpdate) -> dict:
    updated = database.update_order_status(order_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return updated


@app.get("/", include_in_schema=False)
def frontend_index() -> FileResponse:
    return FileResponse(PROJECT_ROOT / "index.html")


@app.get("/{filename}", include_in_schema=False)
def frontend_file(filename: str) -> FileResponse:
    if filename not in STATIC_FILES:
        raise HTTPException(status_code=404, detail="Файл не найден")
    return FileResponse(PROJECT_ROOT / filename)

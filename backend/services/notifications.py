import json
import os
import smtplib
import urllib.request
from email.message import EmailMessage


def notify_order(order: dict) -> str:
    sent_channels = []

    if os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_CHAT_ID"):
        send_telegram(order)
        sent_channels.append("telegram")

    if os.getenv("SMTP_HOST") and os.getenv("ORDER_EMAIL_TO"):
        send_email(order)
        sent_channels.append("email")

    return sent_channels[0] if sent_channels else "backend"


def send_telegram(order: dict) -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": format_order_message(order),
        "parse_mode": "HTML",
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=8) as response:
        if response.status >= 400:
            raise RuntimeError(f"Telegram returned status {response.status}")


def send_email(order: dict) -> None:
    message = EmailMessage()
    message["Subject"] = f"Заявка {order['orderNumber']} с сайта MacLine"
    message["From"] = os.getenv("SMTP_FROM", os.environ["ORDER_EMAIL_TO"])
    message["To"] = os.environ["ORDER_EMAIL_TO"]
    message.set_content(format_order_message(order, html=False))

    port = int(os.getenv("SMTP_PORT", "587"))
    with smtplib.SMTP(os.environ["SMTP_HOST"], port, timeout=8) as smtp:
        if os.getenv("SMTP_USE_TLS", "1") == "1":
            smtp.starttls()
        if os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"):
            smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
        smtp.send_message(message)


def format_order_message(order: dict, html: bool = True) -> str:
    lines = [
        f"Новая заявка {order['orderNumber']}",
        "",
        f"Клиент: {order['customer']['name']}",
        f"Телефон: {order['customer']['phone']}",
        f"Email: {order['customer'].get('email') or 'не указан'}",
        f"Связь: {order['customer']['preferredContact']}",
        f"Получение: {order['delivery']['method']}",
        f"Адрес/комментарий: {order['delivery']['address']}",
        "",
        "Состав заказа:",
        *[
            f"- {item['name']} x {item['quantity']} = {format_price(item['price'] * item['quantity'])}"
            for item in order["items"]
        ],
        "",
        f"Итого: {format_price(order['total'])}",
    ]
    message = "\n".join(lines)
    if not html:
        return message
    return (
        message.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace(f"Новая заявка {order['orderNumber']}", f"<b>Новая заявка {order['orderNumber']}</b>")
    )


def format_price(value: int) -> str:
    return f"{value:,}".replace(",", " ") + " ₽"

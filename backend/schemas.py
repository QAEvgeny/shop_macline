from pydantic import BaseModel, Field


class ProductImage(BaseModel):
    src: str
    alt: str


class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    line: str
    price: int
    oldPrice: int | None = None
    rating: float
    popular: int
    isNew: bool
    inStock: bool
    sale: bool
    art: str
    image: ProductImage | None = None
    specs: list[str]
    tags: list[str]


class CustomerIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = ""
    phone: str = Field(min_length=5, max_length=40)
    preferredContact: str = "phone"


class DeliveryIn(BaseModel):
    method: str = "courier"
    address: str = Field(min_length=3, max_length=500)


class OrderItemIn(BaseModel):
    id: int
    name: str | None = None
    price: int | None = None
    quantity: int = Field(gt=0, le=99)


class OrderCreate(BaseModel):
    customer: CustomerIn
    delivery: DeliveryIn
    items: list[OrderItemIn]
    total: int | None = None
    comment: str | None = None


class OrderCreated(BaseModel):
    orderNumber: str
    status: str
    delivery: str
    total: int


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|processing|ready|delivered|cancelled)$")

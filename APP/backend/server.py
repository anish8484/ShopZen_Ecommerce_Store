from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import secrets


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Constants
NTH_ORDER_FOR_DISCOUNT = 10
DISCOUNT_PERCENTAGE = 10

# Define Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image: str
    category: str
    stock: int = 100

class CartItem(BaseModel):
    product_id: str
    quantity: int
    name: str
    price: float
    image: str

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    cart_id: Optional[str] = None
    product_id: str
    quantity: int = 1

class DiscountCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    code: str
    percentage: float
    is_used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_at: Optional[datetime] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItem]
    subtotal: float
    discount_code: Optional[str] = None
    discount_amount: float = 0.0
    total: float
    customer_name: str
    customer_email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    generated_discount_code: Optional[str] = None

class CheckoutRequest(BaseModel):
    cart_id: str
    customer_name: str
    customer_email: str
    discount_code: Optional[str] = None

class AdminStats(BaseModel):
    total_orders: int
    total_items_purchased: int
    total_purchase_amount: float
    discount_codes: List[dict]
    total_discount_amount: float

# Initialize sample products
async def init_sample_products():
    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Wireless Headphones",
                "description": "Premium noise-cancelling wireless headphones with 30-hour battery life",
                "price": 199.99,
                "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                "category": "Electronics",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Smart Watch",
                "description": "Fitness tracking smartwatch with heart rate monitor and GPS",
                "price": 299.99,
                "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                "category": "Electronics",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Laptop Stand",
                "description": "Ergonomic aluminum laptop stand with adjustable height",
                "price": 49.99,
                "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
                "category": "Accessories",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Mechanical Keyboard",
                "description": "RGB backlit mechanical gaming keyboard with blue switches",
                "price": 129.99,
                "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
                "category": "Electronics",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Wireless Mouse",
                "description": "Ergonomic wireless mouse with precision tracking",
                "price": 39.99,
                "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
                "category": "Electronics",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "USB-C Hub",
                "description": "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
                "price": 59.99,
                "image": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
                "category": "Accessories",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Phone Case",
                "description": "Premium leather phone case with card holder",
                "price": 29.99,
                "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500",
                "category": "Accessories",
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Portable Charger",
                "description": "20000mAh portable power bank with fast charging",
                "price": 44.99,
                "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
                "category": "Electronics",
                "stock": 100
            }
        ]
        await db.products.insert_many(sample_products)
        logger.info(f"Initialized {len(sample_products)} sample products")

# Products API
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Cart APIs
@api_router.post("/cart/add")
async def add_to_cart(request: AddToCartRequest):
    # Get product
    product = await db.products.find_one({"id": request.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart_id = request.cart_id
    if cart_id:
        cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
    else:
        cart_id = str(uuid.uuid4())
        cart = {
            "id": cart_id,
            "items": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Add or update item in cart
    cart_item = {
        "product_id": request.product_id,
        "quantity": request.quantity,
        "name": product["name"],
        "price": product["price"],
        "image": product["image"]
    }
    
    # Check if item already exists in cart
    item_exists = False
    for i, item in enumerate(cart["items"]):
        if item["product_id"] == request.product_id:
            cart["items"][i]["quantity"] += request.quantity
            item_exists = True
            break
    
    if not item_exists:
        cart["items"].append(cart_item)
    
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Save cart
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": cart},
        upsert=True
    )
    
    return {"cart_id": cart_id, "cart": cart}

@api_router.get("/cart/{cart_id}")
async def get_cart(cart_id: str):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@api_router.delete("/cart/{cart_id}/item/{product_id}")
async def remove_from_cart(cart_id: str, product_id: str):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": cart}
    )
    
    return {"message": "Item removed", "cart": cart}

@api_router.put("/cart/{cart_id}/item/{product_id}")
async def update_cart_item(cart_id: str, product_id: str, quantity: int):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    for i, item in enumerate(cart["items"]):
        if item["product_id"] == product_id:
            if quantity <= 0:
                cart["items"].pop(i)
            else:
                cart["items"][i]["quantity"] = quantity
            break
    
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": cart}
    )
    
    return {"message": "Cart updated", "cart": cart}

# Checkout API
@api_router.post("/checkout", response_model=Order)
async def checkout(request: CheckoutRequest):
    # Get cart
    cart = await db.carts.find_one({"id": request.cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate subtotal
    subtotal = sum(item["price"] * item["quantity"] for item in cart["items"])
    
    # Validate discount code if provided
    discount_amount = 0.0
    discount_code_str = None
    if request.discount_code:
        discount_code = await db.discount_codes.find_one(
            {"code": request.discount_code, "is_used": False},
            {"_id": 0}
        )
        if not discount_code:
            raise HTTPException(status_code=400, detail="Invalid or already used discount code")
        
        # Apply discount
        discount_amount = subtotal * (discount_code["percentage"] / 100)
        discount_code_str = request.discount_code
        
        # Mark discount code as used
        await db.discount_codes.update_one(
            {"code": request.discount_code},
            {"$set": {"is_used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    total = subtotal - discount_amount
    
    # Count total items
    total_items = sum(item["quantity"] for item in cart["items"])
    
    # Create order
    order = {
        "id": str(uuid.uuid4()),
        "items": cart["items"],
        "subtotal": subtotal,
        "discount_code": discount_code_str,
        "discount_amount": discount_amount,
        "total": total,
        "customer_name": request.customer_name,
        "customer_email": request.customer_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order)
    
    # Clear cart
    await db.carts.delete_one({"id": request.cart_id})
    
    # Check if this is the nth order and generate discount code
    total_orders = await db.orders.count_documents({})
    new_discount_code = None
    if total_orders % NTH_ORDER_FOR_DISCOUNT == 0:
        # Generate new discount code
        code = f"DISCOUNT{secrets.token_hex(4).upper()}"
        new_discount_code = {
            "code": code,
            "percentage": DISCOUNT_PERCENTAGE,
            "is_used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "used_at": None
        }
        await db.discount_codes.insert_one(new_discount_code)
        order["generated_discount_code"] = code
    
    return order

# Admin APIs
@api_router.post("/admin/generate-discount")
async def generate_discount_code():
    # Check if current order count satisfies nth order condition
    total_orders = await db.orders.count_documents({})
    
    if total_orders % NTH_ORDER_FOR_DISCOUNT != 0:
        raise HTTPException(
            status_code=400,
            detail=f"Discount code can only be generated on every {NTH_ORDER_FOR_DISCOUNT}th order. Current orders: {total_orders}"
        )
    
    # Generate discount code
    code = f"DISCOUNT{secrets.token_hex(4).upper()}"
    discount_code = {
        "code": code,
        "percentage": DISCOUNT_PERCENTAGE,
        "is_used": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "used_at": None
    }
    
    await db.discount_codes.insert_one(discount_code)
    
    return {"message": "Discount code generated", "code": code, "percentage": DISCOUNT_PERCENTAGE}

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats():
    # Get all orders
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    
    # Calculate stats
    total_orders = len(orders)
    total_items_purchased = sum(
        sum(item["quantity"] for item in order["items"])
        for order in orders
    )
    total_purchase_amount = sum(order["total"] for order in orders)
    
    # Get discount codes
    discount_codes = await db.discount_codes.find({}, {"_id": 0}).to_list(10000)
    total_discount_amount = sum(order.get("discount_amount", 0) for order in orders)
    
    return {
        "total_orders": total_orders,
        "total_items_purchased": total_items_purchased,
        "total_purchase_amount": total_purchase_amount,
        "discount_codes": discount_codes,
        "total_discount_amount": total_discount_amount
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_sample_products()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


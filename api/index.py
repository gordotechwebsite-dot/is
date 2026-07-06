import hashlib
import secrets
import json
import os
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use Edge Config for product storage
EDGE_CONFIG_ID = os.environ.get("EDGE_CONFIG_ID", "ecfg_3rxw6mh0hnz1bkdm5art4amjh7h6")
EDGE_CONFIG_TOKEN = os.environ.get("EDGE_CONFIG_TOKEN", "")
VERCEL_TOKEN = os.environ.get("VERCEL_API_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "team_jahFcvSlgMeKJ8O1FuGI3llO")

TOKENS: dict[str, str] = {}
ADMIN_USER = "admin"
ADMIN_PASS_HASH = hashlib.sha256("isphone2026".encode()).hexdigest()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.replace("Bearer ", "")
    if token not in TOKENS:
        raise HTTPException(status_code=401, detail="Token inválido")
    return TOKENS[token]


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


class ProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    condition: str
    image: str
    storage: list[str]
    colors: list[str]
    price_range: str
    badge: Optional[str] = None
    category: Optional[str] = None


class ProductCreate(BaseModel):
    name: str
    brand: str
    condition: str
    image: str
    storage: list[str]
    colors: list[str]
    price_range: str
    badge: Optional[str] = None
    category: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    cover_image: str


class CategoryCreate(BaseModel):
    name: str
    slug: str
    cover_image: str


# In-memory products (loaded from edge config or defaults)
import urllib.request

INITIAL_PRODUCTS = [
    {"id": 1, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-gray.png", "storage": ["128GB", "256GB"], "colors": ["Negro", "Blanco", "Azul", "Verde", "Morado"], "price_range": "Desde $3.400.000", "badge": "Nuevo"},
    {"id": 2, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-white.png", "storage": ["128GB", "256GB"], "colors": ["Blanco", "Negro", "Azul", "Verde", "Morado"], "price_range": "Desde $3.400.000", "badge": "Nuevo"},
    {"id": 3, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-blue.png", "storage": ["128GB", "256GB"], "colors": ["Azul", "Negro", "Blanco", "Verde", "Morado"], "price_range": "Desde $3.400.000", "badge": "Nuevo"},
    {"id": 4, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-green.png", "storage": ["128GB", "256GB"], "colors": ["Verde", "Negro", "Blanco", "Azul", "Morado"], "price_range": "Desde $3.400.000", "badge": "Nuevo"},
    {"id": 5, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-purple.png", "storage": ["128GB", "256GB"], "colors": ["Morado", "Negro", "Blanco", "Azul", "Verde"], "price_range": "Desde $3.400.000", "badge": "Nuevo"},
    {"id": 6, "name": "iPhone 16 Pro", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-16-dark.png", "storage": ["128GB", "256GB", "512GB"], "colors": ["Titanio Negro", "Titanio Natural", "Titanio Desierto"], "price_range": "Desde $4.800.000", "badge": "Pro"},
    {"id": 7, "name": "iPhone SE 4", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-se4-white.png", "storage": ["128GB", "256GB"], "colors": ["Blanco", "Azul", "Negro", "Rosa"], "price_range": "Desde $2.200.000", "badge": "Nuevo"},
    {"id": 8, "name": "iPhone SE 4", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-se4-blue.png", "storage": ["128GB", "256GB"], "colors": ["Azul", "Blanco", "Negro", "Rosa"], "price_range": "Desde $2.200.000", "badge": "Nuevo"},
    {"id": 9, "name": "iPhone SE 4", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-se4-black.png", "storage": ["128GB", "256GB"], "colors": ["Negro", "Blanco", "Azul", "Rosa"], "price_range": "Desde $2.200.000", "badge": "Nuevo"},
    {"id": 10, "name": "iPhone SE 4", "brand": "apple", "condition": "Nuevo", "image": "/images/products/iphone-se4-pink.png", "storage": ["128GB", "256GB"], "colors": ["Rosa", "Blanco", "Azul", "Negro"], "price_range": "Desde $2.200.000", "badge": "Nuevo"},
    {"id": 11, "name": "Samsung Galaxy S25", "brand": "samsung", "condition": "Nuevo", "image": "/images/products/samsung-s25-gray.png", "storage": ["128GB", "256GB"], "colors": ["Negro", "Azul", "Menta", "Plata"], "price_range": "Desde $3.200.000", "badge": "Galaxy AI"},
    {"id": 12, "name": "Samsung Galaxy S24 Ultra", "brand": "samsung", "condition": "Nuevo", "image": "/images/products/samsung-s24-ultra-gold.png", "storage": ["256GB", "512GB", "1TB"], "colors": ["Titanio Dorado", "Titanio Gris", "Titanio Negro"], "price_range": "Desde $4.800.000", "badge": "Ultra"},
    {"id": 13, "name": "Samsung Galaxy S25", "brand": "samsung", "condition": "Nuevo", "image": "/images/products/samsung-s25-blue.png", "storage": ["128GB", "256GB"], "colors": ["Azul", "Negro", "Menta", "Plata"], "price_range": "Desde $3.200.000", "badge": "Galaxy AI"},
    {"id": 14, "name": "Samsung Galaxy S25", "brand": "samsung", "condition": "Nuevo", "image": "/images/products/samsung-s25-mint.png", "storage": ["128GB", "256GB"], "colors": ["Menta", "Negro", "Azul", "Plata"], "price_range": "Desde $3.200.000", "badge": "Galaxy AI"},
]


def _load_products() -> list[dict]:
    """Load products from Edge Config or return defaults."""
    if EDGE_CONFIG_TOKEN:
        try:
            req = urllib.request.Request(
                f"https://edge-config.vercel.com/{EDGE_CONFIG_ID}/item/products",
                headers={"Authorization": f"Bearer {EDGE_CONFIG_TOKEN}"}
            )
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except Exception:
            pass
    return INITIAL_PRODUCTS


def _save_products(products: list[dict]):
    """Save products to Edge Config."""
    if not VERCEL_TOKEN:
        return
    data = json.dumps({"items": [{"operation": "upsert", "key": "products", "value": products}]}).encode()
    req = urllib.request.Request(
        f"https://api.vercel.com/v1/edge-config/{EDGE_CONFIG_ID}/items?teamId={TEAM_ID}",
        data=data,
        headers={
            "Authorization": f"Bearer {VERCEL_TOKEN}",
            "Content-Type": "application/json"
        },
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass


@app.post("/api/login", response_model=LoginResponse)
def login(data: LoginRequest):
    if data.username != ADMIN_USER or hash_password(data.password) != ADMIN_PASS_HASH:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = secrets.token_hex(32)
    TOKENS[token] = data.username
    return LoginResponse(token=token, username=data.username)


@app.post("/api/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        TOKENS.pop(token, None)
    return {"ok": True}


@app.get("/api/products", response_model=list[ProductResponse])
def get_products():
    return _load_products()


@app.post("/api/admin/products", response_model=ProductResponse)
def create_product(product: ProductCreate, _username: str = Depends(verify_token)):
    products = _load_products()
    new_id = max((p["id"] for p in products), default=0) + 1
    new_product = {"id": new_id, **product.model_dump()}
    products.append(new_product)
    _save_products(products)
    return new_product


@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, _username: str = Depends(verify_token)):
    products = _load_products()
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i] = {"id": product_id, **product.model_dump()}
            _save_products(products)
            return products[i]
    raise HTTPException(status_code=404, detail="Producto no encontrado")


@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, _username: str = Depends(verify_token)):
    products = _load_products()
    products = [p for p in products if p["id"] != product_id]
    _save_products(products)
    return {"ok": True}


# --- Categories ---

INITIAL_CATEGORIES: list[dict] = []


def _load_categories() -> list[dict]:
    if EDGE_CONFIG_TOKEN:
        try:
            req = urllib.request.Request(
                f"https://edge-config.vercel.com/{EDGE_CONFIG_ID}/item/categories",
                headers={"Authorization": f"Bearer {EDGE_CONFIG_TOKEN}"}
            )
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except Exception:
            pass
    return INITIAL_CATEGORIES


def _save_categories(categories: list[dict]):
    if not VERCEL_TOKEN:
        return
    data = json.dumps({"items": [{"operation": "upsert", "key": "categories", "value": categories}]}).encode()
    req = urllib.request.Request(
        f"https://api.vercel.com/v1/edge-config/{EDGE_CONFIG_ID}/items?teamId={TEAM_ID}",
        data=data,
        headers={
            "Authorization": f"Bearer {VERCEL_TOKEN}",
            "Content-Type": "application/json"
        },
        method="PATCH"
    )
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass


@app.get("/api/categories", response_model=list[CategoryResponse])
def get_categories():
    return _load_categories()


@app.post("/api/admin/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, _username: str = Depends(verify_token)):
    categories = _load_categories()
    new_id = max((c["id"] for c in categories), default=0) + 1
    new_cat = {"id": new_id, **category.model_dump()}
    categories.append(new_cat)
    _save_categories(categories)
    return new_cat


@app.put("/api/admin/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryCreate, _username: str = Depends(verify_token)):
    categories = _load_categories()
    for i, c in enumerate(categories):
        if c["id"] == category_id:
            categories[i] = {"id": category_id, **category.model_dump()}
            _save_categories(categories)
            return categories[i]
    raise HTTPException(status_code=404, detail="Categoría no encontrada")


@app.delete("/api/admin/categories/{category_id}")
def delete_category(category_id: int, _username: str = Depends(verify_token)):
    categories = _load_categories()
    categories = [c for c in categories if c["id"] != category_id]
    _save_categories(categories)
    return {"ok": True}

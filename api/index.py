import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EDGE_CONFIG_ID = os.environ.get("EDGE_CONFIG_ID", "ecfg_3rxw6mh0hnz1bkdm5art4amjh7h6")
EDGE_CONFIG_TOKEN = os.environ.get("EDGE_CONFIG_TOKEN", "")
VERCEL_TOKEN = os.environ.get("VERCEL_API_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "team_jahFcvSlgMeKJ8O1FuGI3llO")

ADMIN_USER = "admin"
ADMIN_PASS_HASH = hashlib.sha256("isphone2026".encode()).hexdigest()
TOKEN_SECRET = os.environ.get("TOKEN_SECRET", "isphone-admin-secret-2026")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _make_token(username: str) -> str:
    return hmac.new(TOKEN_SECRET.encode(), username.encode(), hashlib.sha256).hexdigest()


def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.replace("Bearer ", "")
    expected = _make_token(ADMIN_USER)
    if not hmac.compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="Token inválido")
    return ADMIN_USER


# --- Edge Config helpers ---

def _ec_load(key: str, default=None):
    if EDGE_CONFIG_TOKEN:
        try:
            req = urllib.request.Request(
                f"https://edge-config.vercel.com/{EDGE_CONFIG_ID}/item/{key}",
                headers={"Authorization": f"Bearer {EDGE_CONFIG_TOKEN}"}
            )
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except Exception:
            pass
    return default


def _ec_save(key: str, value):
    if not VERCEL_TOKEN:
        raise HTTPException(status_code=500, detail="No se pudo guardar: token no configurado")
    data = json.dumps({"items": [{"operation": "upsert", "key": key, "value": value}]}).encode()
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
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            if result.get("status") != "ok":
                raise HTTPException(status_code=500, detail=f"Error al guardar: {result}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise HTTPException(status_code=500, detail=f"Error al guardar ({e.code}): {body}")


def _save_image_if_base64(image_value: str, key: str, request: Request) -> str:
    if image_value.startswith("data:image"):
        _ec_save(key, image_value)
        base_url = str(request.base_url).rstrip("/")
        return f"{base_url}/api/images/{key}"
    return image_value


@app.get("/api/images/{key}")
def get_image(key: str):
    data_url = _ec_load(key)
    if not data_url or not isinstance(data_url, str) or not data_url.startswith("data:"):
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    header, b64data = data_url.split(",", 1)
    content_type = header.split(":")[1].split(";")[0]
    image_bytes = base64.b64decode(b64data)
    return Response(content=image_bytes, media_type=content_type,
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


# --- Models ---

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
    position: int = 0

class CategoryCreate(BaseModel):
    name: str
    slug: str
    cover_image: str
    position: int = 0

class OfferResponse(BaseModel):
    id: int
    title: str
    description: str
    badge: Optional[str] = None
    icon: Optional[str] = None
    featured: bool = False
    active: bool = True

class OfferCreate(BaseModel):
    title: str
    description: str
    badge: Optional[str] = None
    icon: Optional[str] = None
    featured: bool = False
    active: bool = True

class SiteContent(BaseModel):
    hero_subtitle: str = "Evolución en tus manos"
    hero_title_1: str = "Tu próximo"
    hero_title_2: str = "smartphone"
    hero_title_3: str = "te espera"
    hero_description: str = "Equipos nuevos y de exhibición. iPhone y Android al mejor precio en Boyacá. Envíos y contra entrega."
    hero_image: str = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=700&fit=crop"
    hero_cta_text: str = "Ver catálogo"
    cta_title: str = "¿Listo para actualizar?"
    cta_description: str = "Escríbenos por WhatsApp y te asesoramos con el equipo perfecto para ti"
    cta_button_text: str = "Escribir por WhatsApp"
    banner_text: str = "OBTÉN UN REGALO POR TU PRIMERA COMPRA MAYOR A $250.000"
    banner_active: bool = True


# --- Defaults ---

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

INITIAL_OFFERS = [
    {"id": 1, "title": "Regalo primera compra", "description": "Compras mayores a $250.000 reciben un regalo sorpresa. Válido para clientes nuevos.", "badge": "🎁 PROMOCIÓN ACTIVA", "icon": "gift", "featured": True, "active": True},
    {"id": 2, "title": "Trade-In con descuento extra", "description": "Trae tu equipo anterior y recibe un descuento adicional sobre el valor de Trade-In.", "icon": "percent", "featured": False, "active": True},
    {"id": 3, "title": "Equipos de exhibición", "description": "Equipos como nuevos con hasta 30% de descuento. Garantía incluida en todos.", "icon": "tag", "featured": False, "active": True},
]

DEFAULT_SITE_CONTENT = SiteContent().model_dump()


# --- Auth ---

@app.post("/api/login", response_model=LoginResponse)
def login(data: LoginRequest):
    if data.username != ADMIN_USER or hash_password(data.password) != ADMIN_PASS_HASH:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = _make_token(data.username)
    return LoginResponse(token=token, username=data.username)

@app.post("/api/logout")
def logout(authorization: Optional[str] = Header(None)):
    return {"ok": True}


# --- Products ---

@app.get("/api/products", response_model=list[ProductResponse])
def get_products():
    return _ec_load("products", INITIAL_PRODUCTS)

@app.post("/api/admin/products", response_model=ProductResponse)
def create_product(product: ProductCreate, request: Request, _username: str = Depends(verify_token)):
    products = _ec_load("products", INITIAL_PRODUCTS)
    new_id = max((p["id"] for p in products), default=0) + 1
    prod_data = product.model_dump()
    prod_data["image"] = _save_image_if_base64(prod_data["image"], f"prod_img_{new_id}", request)
    new_product = {"id": new_id, **prod_data}
    products.append(new_product)
    _ec_save("products", products)
    return new_product

@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, request: Request, _username: str = Depends(verify_token)):
    products = _ec_load("products", INITIAL_PRODUCTS)
    for i, p in enumerate(products):
        if p["id"] == product_id:
            prod_data = product.model_dump()
            prod_data["image"] = _save_image_if_base64(prod_data["image"], f"prod_img_{product_id}", request)
            products[i] = {"id": product_id, **prod_data}
            _ec_save("products", products)
            return products[i]
    raise HTTPException(status_code=404, detail="Producto no encontrado")

@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, _username: str = Depends(verify_token)):
    products = _ec_load("products", INITIAL_PRODUCTS)
    products = [p for p in products if p["id"] != product_id]
    _ec_save("products", products)
    return {"ok": True}


# --- Categories ---

INITIAL_CATEGORIES = [
    {"id": 1, "name": "iPhone", "slug": "iphone", "cover_image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop", "position": 1},
    {"id": 2, "name": "Android", "slug": "android", "cover_image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop", "position": 2},
    {"id": 3, "name": "Accesorios", "slug": "accesorios", "cover_image": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop", "position": 3},
    {"id": 4, "name": "Ofertas", "slug": "ofertas", "cover_image": "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=600&fit=crop", "position": 4},
    {"id": 5, "name": "iPads", "slug": "ipads", "cover_image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", "position": 5},
    {"id": 6, "name": "MacBooks", "slug": "macbooks", "cover_image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop", "position": 6},
]

@app.get("/api/categories", response_model=list[CategoryResponse])
def get_categories():
    cats = _ec_load("categories", INITIAL_CATEGORIES)
    return sorted(cats, key=lambda c: c.get("position", 0))

@app.post("/api/admin/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, request: Request, _username: str = Depends(verify_token)):
    categories = _ec_load("categories", INITIAL_CATEGORIES)
    new_id = max((c["id"] for c in categories), default=0) + 1
    cat_data = category.model_dump()
    cat_data["cover_image"] = _save_image_if_base64(cat_data["cover_image"], f"cat_img_{new_id}", request)
    new_cat = {"id": new_id, **cat_data}
    categories.append(new_cat)
    _ec_save("categories", categories)
    return new_cat

@app.put("/api/admin/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryCreate, request: Request, _username: str = Depends(verify_token)):
    categories = _ec_load("categories", INITIAL_CATEGORIES)
    for i, c in enumerate(categories):
        if c["id"] == category_id:
            cat_data = category.model_dump()
            cat_data["cover_image"] = _save_image_if_base64(cat_data["cover_image"], f"cat_img_{category_id}", request)
            categories[i] = {"id": category_id, **cat_data}
            _ec_save("categories", categories)
            return categories[i]
    raise HTTPException(status_code=404, detail="Categoría no encontrada")

@app.delete("/api/admin/categories/{category_id}")
def delete_category(category_id: int, _username: str = Depends(verify_token)):
    categories = _ec_load("categories", INITIAL_CATEGORIES)
    categories = [c for c in categories if c["id"] != category_id]
    _ec_save("categories", categories)
    return {"ok": True}


# --- Offers ---

@app.get("/api/offers", response_model=list[OfferResponse])
def get_offers():
    return _ec_load("offers", INITIAL_OFFERS)

@app.post("/api/admin/offers", response_model=OfferResponse)
def create_offer(offer: OfferCreate, _username: str = Depends(verify_token)):
    offers = _ec_load("offers", INITIAL_OFFERS)
    new_id = max((o["id"] for o in offers), default=0) + 1
    new_offer = {"id": new_id, **offer.model_dump()}
    offers.append(new_offer)
    _ec_save("offers", offers)
    return new_offer

@app.put("/api/admin/offers/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: int, offer: OfferCreate, _username: str = Depends(verify_token)):
    offers = _ec_load("offers", INITIAL_OFFERS)
    for i, o in enumerate(offers):
        if o["id"] == offer_id:
            offers[i] = {"id": offer_id, **offer.model_dump()}
            _ec_save("offers", offers)
            return offers[i]
    raise HTTPException(status_code=404, detail="Oferta no encontrada")

@app.delete("/api/admin/offers/{offer_id}")
def delete_offer(offer_id: int, _username: str = Depends(verify_token)):
    offers = _ec_load("offers", INITIAL_OFFERS)
    offers = [o for o in offers if o["id"] != offer_id]
    _ec_save("offers", offers)
    return {"ok": True}


# --- Site Content ---

@app.get("/api/site-content")
def get_site_content():
    return _ec_load("site_content", DEFAULT_SITE_CONTENT)

@app.put("/api/admin/site-content")
def update_site_content(content: SiteContent, _username: str = Depends(verify_token)):
    data = content.model_dump()
    _ec_save("site_content", data)
    return data

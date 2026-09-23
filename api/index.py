import base64
import hashlib
import hmac
import json
import os
import re
import time
import unicodedata
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


BLOB_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN", "")

_EXT_BY_TYPE = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}


def _upload_to_blob(data_url: str, key: str) -> str:
    header, b64data = data_url.split(",", 1)
    content_type = header.split(":")[1].split(";")[0]
    image_bytes = base64.b64decode(b64data)
    ext = _EXT_BY_TYPE.get(content_type, "jpg")
    req = urllib.request.Request(
        f"https://blob.vercel-storage.com/{key}.{ext}",
        data=image_bytes,
        headers={
            "authorization": f"Bearer {BLOB_TOKEN}",
            "x-content-type": content_type,
            "x-api-version": "7",
            "x-add-random-suffix": "1",
            "x-cache-control-max-age": "31536000",
        },
        method="PUT",
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["url"]


MAX_UPLOAD_BYTES = 100 * 1024 * 1024


def _client_upload_token(pathname: str, content_type: str) -> str:
    """Short-lived token that lets the admin upload straight to Vercel Blob.

    Avoids routing large files (videos) through the serverless function, which
    caps request bodies at 4.5 MB.
    """
    store_id = BLOB_TOKEN.split("_")[3]
    payload = base64.b64encode(json.dumps({
        "pathname": pathname,
        "allowedContentTypes": [content_type],
        "maximumSizeInBytes": MAX_UPLOAD_BYTES,
        "addRandomSuffix": True,
        "cacheControlMaxAge": 31536000,
        "validUntil": int(time.time() * 1000) + 120_000,
    }, separators=(",", ":")).encode()).decode()
    signature = hmac.new(BLOB_TOKEN.encode(), payload.encode(), hashlib.sha256).hexdigest()
    secured = base64.b64encode(f"{signature}.{payload}".encode()).decode()
    return f"vercel_blob_client_{store_id}_{secured}"


def _save_image_if_base64(image_value: str, key: str, request: Request) -> str:
    if image_value.startswith("data:image"):
        if BLOB_TOKEN:
            try:
                return _upload_to_blob(image_value, key)
            except urllib.error.HTTPError as e:
                body = e.read().decode()
                raise HTTPException(status_code=500, detail=f"Error al subir imagen ({e.code}): {body}")
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

class Variant(BaseModel):
    storage: str = ""
    color: str = ""
    sim: str = ""
    price: str = ""

class ColorOption(BaseModel):
    name: str
    hex: str = "#888888"
    images: list[str] = []

class ProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    condition: str
    image: str
    images: list[str] = []
    storage: list[str]
    colors: list[str]
    sim_options: list[str] = []
    price_range: str
    badge: Optional[str] = None
    category: Optional[str] = None
    variants: list[Variant] = []
    featured: bool = False
    color_options: list[ColorOption] = []

class ProductCreate(BaseModel):
    name: str
    brand: str
    condition: str
    image: str
    images: list[str] = []
    storage: list[str]
    colors: list[str]
    sim_options: list[str] = []
    price_range: str
    badge: Optional[str] = None
    category: Optional[str] = None
    variants: list[Variant] = []
    featured: bool = False
    color_options: list[ColorOption] = []

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    cover_image: str
    header_image: str = ""
    position: int = 0

class CategoryCreate(BaseModel):
    name: str
    slug: str
    cover_image: str
    header_image: str = ""
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

class BannerResponse(BaseModel):
    id: int
    image: str
    link: Optional[str] = None
    position: int = 0
    active: bool = True

class BannerCreate(BaseModel):
    image: str
    link: Optional[str] = None
    position: int = 0
    active: bool = True

class UploadTokenRequest(BaseModel):
    filename: str
    content_type: str

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
    hero_video: str = ""
    hero_video_poster: str = ""
    hero_videos: list[str] = []


# --- Defaults ---

_PH = "/images/apple-logo.webp"

INITIAL_PRODUCTS = [
    {"id": 1, "name": "iPhone 12 Pro Max", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.150.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.150.000"}]},
    {"id": 2, "name": "iPhone 14 Pro", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $2.550.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.550.000"}, {"storage": "256GB", "color": "", "price": "$2.750.000"}]},
    {"id": 3, "name": "iPhone 14 Pro Max", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $3.090.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$3.090.000"}, {"storage": "256GB", "color": "", "price": "$3.290.000"}]},
    {"id": 4, "name": "iPhone 15 Pro", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.950.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.950.000"}]},
    {"id": 5, "name": "iPhone 15 Pro Max", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$3.500.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$3.500.000"}]},
    {"id": 6, "name": "iPhone 16 Pro Max", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$3.800.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$3.800.000"}]},
    {"id": 7, "name": "iPhone 13", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$1.950.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.950.000"}]},
    {"id": 8, "name": "iPhone 14", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.100.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.100.000"}]},
    {"id": 9, "name": "iPhone 15", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.450.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.450.000"}]},
    {"id": 10, "name": "iPhone 16", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.780.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.780.000"}]},
    {"id": 11, "name": "iPhone 17e", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$2.480.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$2.480.000"}]},
    {"id": 12, "name": "iPhone 17", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$3.380.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$3.380.000"}]},
    {"id": 13, "name": "iPhone 17 Pro", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$4.150.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$4.150.000"}]},
    {"id": 14, "name": "iPhone 17 Pro Max", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": ["256GB", "512GB", "1TB"], "colors": [], "sim_options": ["eSIM", "SIM Física"], "price_range": "Desde $4.300.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "sim": "eSIM", "price": "$4.300.000"}, {"storage": "512GB", "color": "", "sim": "eSIM", "price": "$5.900.000"}, {"storage": "1TB", "color": "", "sim": "eSIM", "price": "$6.500.000"}, {"storage": "256GB", "color": "", "sim": "SIM Física", "price": "$4.850.000"}]},
    {"id": 16, "name": "iPhone 13", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $1.250.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.250.000"}, {"storage": "256GB", "color": "", "price": "$1.350.000"}]},
    {"id": 17, "name": "iPhone 14", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$1.400.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.400.000"}]},
    {"id": 18, "name": "iPhone 13 Pro", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $1.790.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.790.000"}, {"storage": "256GB", "color": "", "price": "$1.900.000"}]},
    {"id": 19, "name": "iPhone 13 Pro Max", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB", "1TB"], "colors": [], "price_range": "Desde $1.950.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.950.000"}, {"storage": "256GB", "color": "", "price": "$2.200.000"}, {"storage": "1TB", "color": "", "price": "$2.400.000"}]},
    {"id": 20, "name": "iPhone 14 Pro Max", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB", "512GB"], "colors": [], "price_range": "Desde $2.250.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.250.000"}, {"storage": "256GB", "color": "", "price": "$2.350.000"}, {"storage": "512GB", "color": "", "price": "$2.450.000"}]},
    {"id": 21, "name": "iPhone 15", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$1.850.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$1.850.000"}]},
    {"id": 22, "name": "iPhone 15 Pro", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $2.250.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.250.000"}, {"storage": "256GB", "color": "", "price": "$2.400.000"}]},
    {"id": 23, "name": "iPhone 15 Pro Max", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["256GB", "512GB"], "colors": [], "price_range": "Desde $2.700.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$2.700.000"}, {"storage": "512GB", "color": "", "price": "$2.900.000"}]},
    {"id": 24, "name": "iPhone 15 Plus", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.150.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.150.000"}]},
    {"id": 25, "name": "iPhone 16", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB"], "colors": [], "price_range": "$2.350.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.350.000"}]},
    {"id": 26, "name": "iPhone 16 Pro", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["128GB", "256GB"], "colors": [], "price_range": "Desde $2.900.000", "category": "iphone", "variants": [{"storage": "128GB", "color": "", "price": "$2.900.000"}, {"storage": "256GB", "color": "", "price": "$3.050.000"}]},
    {"id": 27, "name": "iPhone 16 Pro Max", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["256GB", "512GB"], "colors": [], "price_range": "Desde $3.350.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$3.350.000"}, {"storage": "512GB", "color": "", "price": "$3.500.000"}]},
    {"id": 28, "name": "iPhone 17 Pro", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$3.950.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$3.950.000"}]},
    {"id": 29, "name": "iPhone 17 Pro Max", "brand": "apple", "condition": "Exhibición", "image": _PH, "storage": ["256GB"], "colors": [], "price_range": "$4.150.000", "category": "iphone", "variants": [{"storage": "256GB", "color": "", "price": "$4.150.000"}]},
    {"id": 30, "name": "AirTag", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$99.000", "category": "accesorios", "variants": []},
    {"id": 31, "name": "AirTag (Caja x4)", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$380.000", "category": "accesorios", "variants": []},
    {"id": 32, "name": "Apple Pencil Pro", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$490.000", "category": "accesorios", "variants": []},
    {"id": 33, "name": "Apple Pencil (USB-C)", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$380.000", "category": "accesorios", "variants": []},
    {"id": 34, "name": "AirPods Pro 3", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$950.000", "category": "accesorios", "variants": []},
    {"id": 35, "name": "AirPods Pro 2", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$780.000", "category": "accesorios", "variants": []},
    {"id": 36, "name": "AirPods Max (2da gen)", "brand": "apple", "condition": "Nuevo", "image": _PH, "storage": [], "colors": [], "price_range": "$1.990.000", "category": "accesorios", "variants": []},
]

INITIAL_OFFERS = [
    {"id": 1, "title": "Regalo primera compra", "description": "Compras mayores a $250.000 reciben un regalo sorpresa. Válido para clientes nuevos.", "badge": None, "icon": "gift", "featured": True, "active": True},
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

def _persist_product_images(prod_data: dict, product_id: int, request: Request) -> dict:
    prod_data["images"] = [
        _save_image_if_base64(img, f"prod_img_{product_id}_{idx}", request)
        for idx, img in enumerate(prod_data["images"]) if img
    ]
    cover = prod_data["image"] or (prod_data["images"][0] if prod_data["images"] else "")
    prod_data["image"] = _save_image_if_base64(cover, f"prod_img_{product_id}", request)
    for cidx, opt in enumerate(prod_data.get("color_options", [])):
        opt["images"] = [
            _save_image_if_base64(img, f"prod_img_{product_id}_c{cidx}_{idx}", request)
            for idx, img in enumerate(opt["images"]) if img
        ]
    return prod_data

@app.post("/api/admin/products", response_model=ProductResponse)
def create_product(product: ProductCreate, request: Request, _username: str = Depends(verify_token)):
    products = _ec_load("products", INITIAL_PRODUCTS)
    new_id = max((p["id"] for p in products), default=0) + 1
    prod_data = _persist_product_images(product.model_dump(), new_id, request)
    new_product = {"id": new_id, **prod_data}
    products.append(new_product)
    _ec_save("products", products)
    return new_product

@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, request: Request, _username: str = Depends(verify_token)):
    products = _ec_load("products", INITIAL_PRODUCTS)
    for i, p in enumerate(products):
        if p["id"] == product_id:
            prod_data = _persist_product_images(product.model_dump(), product_id, request)
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
    cat_data["header_image"] = _save_image_if_base64(cat_data["header_image"], f"cat_header_{new_id}", request)
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
            cat_data["header_image"] = _save_image_if_base64(cat_data["header_image"], f"cat_header_{category_id}", request)
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


# --- Banners ---

INITIAL_BANNERS = [
    {"id": 1, "image": "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop", "link": "/catalogo", "position": 1, "active": True},
    {"id": 2, "image": "https://images.unsplash.com/photo-1592286927505-1def25115558?w=1200&h=400&fit=crop", "link": "/ofertas", "position": 2, "active": True},
]

@app.get("/api/banners", response_model=list[BannerResponse])
def get_banners():
    banners = _ec_load("banners", INITIAL_BANNERS)
    return sorted([b for b in banners if b.get("active", True)], key=lambda b: b.get("position", 0))

@app.get("/api/admin/banners", response_model=list[BannerResponse])
def get_all_banners(_username: str = Depends(verify_token)):
    banners = _ec_load("banners", INITIAL_BANNERS)
    return sorted(banners, key=lambda b: b.get("position", 0))

@app.post("/api/admin/banners", response_model=BannerResponse)
def create_banner(banner: BannerCreate, request: Request, _username: str = Depends(verify_token)):
    banners = _ec_load("banners", INITIAL_BANNERS)
    new_id = max((b["id"] for b in banners), default=0) + 1
    banner_data = banner.model_dump()
    banner_data["image"] = _save_image_if_base64(banner_data["image"], f"banner_img_{new_id}", request)
    new_banner = {"id": new_id, **banner_data}
    banners.append(new_banner)
    _ec_save("banners", banners)
    return new_banner

@app.put("/api/admin/banners/{banner_id}", response_model=BannerResponse)
def update_banner(banner_id: int, banner: BannerCreate, request: Request, _username: str = Depends(verify_token)):
    banners = _ec_load("banners", INITIAL_BANNERS)
    for i, b in enumerate(banners):
        if b["id"] == banner_id:
            banner_data = banner.model_dump()
            banner_data["image"] = _save_image_if_base64(banner_data["image"], f"banner_img_{banner_id}", request)
            banners[i] = {"id": banner_id, **banner_data}
            _ec_save("banners", banners)
            return banners[i]
    raise HTTPException(status_code=404, detail="Banner no encontrado")

@app.delete("/api/admin/banners/{banner_id}")
def delete_banner(banner_id: int, _username: str = Depends(verify_token)):
    banners = _ec_load("banners", INITIAL_BANNERS)
    banners = [b for b in banners if b["id"] != banner_id]
    _ec_save("banners", banners)
    return {"ok": True}


# --- SEO ---

SITE_URL = "https://isphone.co"
STATIC_PAGES = ["", "/catalogo", "/destacados", "/ofertas", "/reparaciones", "/trade-in", "/envios", "/contacto"]

def slugify(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")


def product_path(prod: dict) -> str:
    slug = slugify(str(prod.get("name", "")))
    return f"/producto/{slug}-{prod['id']}" if slug else f"/producto/{prod['id']}"


def _xml_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

@app.get("/api/sitemap.xml")
def get_sitemap():
    today = time.strftime("%Y-%m-%d")
    urls: list[tuple[str, str, str]] = [(f"{SITE_URL}{p}", "1.0" if p == "" else "0.8", "weekly") for p in STATIC_PAGES]
    for cat in _ec_load("categories", INITIAL_CATEGORIES):
        urls.append((f"{SITE_URL}/categoria/{cat['slug']}", "0.9", "daily"))
    for prod in _ec_load("products", INITIAL_PRODUCTS):
        urls.append((f"{SITE_URL}{product_path(prod)}", "0.7", "weekly"))
    body = "".join(
        f"<url><loc>{_xml_escape(loc)}</loc><lastmod>{today}</lastmod>"
        f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        for loc, prio, freq in urls
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>'
    return Response(content=xml, media_type="application/xml",
                    headers={"Cache-Control": "public, max-age=3600"})


# --- Prerender (HTML para crawlers: Google, Bing, WhatsApp, Facebook, etc.) ---

SERVICE_CITIES = ["Tunja", "Ramiriquí", "Jenesano", "Tibaná", "Soracá", "Ciénega", "Paipa", "Bogotá", "Chía", "Cajicá"]
_CITIES_TEXT = ", ".join(SERVICE_CITIES[:-1]) + " y " + SERVICE_CITIES[-1]

_STATIC_META = {
    "": ("iSphone | iPhone, Samsung, iPad y Mac en Tunja, Boyacá y Bogotá",
         "Tienda de tecnología Apple y Android en Tunja y Boyacá: iPhone, Samsung, iPad, MacBook y accesorios nuevos y de exhibición con garantía. Precios en Colombia, Trade-In, servicio técnico y contra entrega en Bogotá, Chía y Cajicá.",
         "Tienda de tecnología Apple y Android en Tunja, Boyacá y Bogotá"),
    "/catalogo": ("Catálogo: iPhone, Samsung, iPad, Mac y accesorios en Tunja y Boyacá",
                  "Todas las categorías de iSphone: iPhone, Samsung y Android, iPad, MacBook, computadores y accesorios, nuevos y de exhibición con garantía. Tunja, Boyacá, Bogotá, Chía y Cajicá.",
                  "Catálogo"),
    "/destacados": ("Productos destacados", "Los iPhone, Samsung y accesorios más buscados en iSphone, nuevos y de exhibición con garantía. Precio en Colombia y contra entrega en Tunja, Boyacá y Bogotá.", "Destacados"),
    "/ofertas": ("Ofertas en iPhone, Samsung y accesorios", "Promociones y descuentos en iPhone, Samsung, iPad y accesorios en iSphone. Ofertas vigentes con garantía y contra entrega en Tunja, Boyacá y Bogotá.", "Ofertas"),
    "/reparaciones": ("Reparación de iPhone, iPad, MacBook, Apple Watch y Android en Tunja y Boyacá",
                      "Servicio técnico Apple y Android en Tunja, Boyacá y Bogotá: cambio de pantalla, batería, puerto de carga, cámara, daño por agua y software. Repuestos originales y garantía. Cotiza por WhatsApp.",
                      "Servicio técnico y reparaciones"),
    "/trade-in": ("Trade-In en Tunja y Boyacá: entrega tu iPhone o Samsung usado y estrena",
                  "Recibimos tu iPhone, Samsung o Android usado como parte de pago por un equipo nuevo o de exhibición. Valoración en 15 minutos en Tunja, Ramiriquí, Boyacá, Bogotá, Chía y Cajicá.",
                  "Trade-In: entrega tu equipo usado y estrena"),
    "/envios": ("Envíos y pago contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá",
                "Compra iPhone, Samsung, iPad, MacBook y accesorios con envío y pago contra entrega en Tunja, Ramiriquí, Jenesano, Tibaná, Soracá, Ciénega, Paipa, Bogotá, Chía y Cajicá. Envíos a todo Boyacá y Colombia.",
                "Envíos y pago contra entrega"),
    "/contacto": ("Contacto: tienda iPhone y tecnología en Tunja, Boyacá y Bogotá",
                  "Escríbenos por WhatsApp (+57 318 682 3290). Atendemos en Tunja, Ramiriquí, Jenesano, Tibaná, Soracá, Ciénega, Paipa, Bogotá, Chía y Cajicá: iPhone, Samsung, iPad, MacBook, accesorios y servicio técnico.",
                  "Contacto"),
}

_CATEGORY_META = {
    "iphone": ("iPhone nuevos y de exhibición en Tunja y Boyacá — precio en Colombia",
               "Tienda de iPhone en Tunja y Boyacá: iPhone 18, 17, 16 y 15 nuevos y de exhibición con garantía. Precios en pesos colombianos por capacidad, Trade-In y contra entrega en Bogotá, Chía y Cajicá."),
    "android": ("Samsung y Android en Tunja y Boyacá — precio en Colombia",
                "Samsung Galaxy S26 Ultra, S25 Ultra, A57, A37, A17 y más, nuevos y con garantía. Precio en Colombia por capacidad, Trade-In y envío contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá."),
    "accesorios": ("Accesorios Apple y celulares en Tunja y Boyacá: AirPods, cargadores, fundas",
                   "Accesorios originales para iPhone, iPad, Mac y Android: AirPods, cargadores, cables, fundas y protectores. Compra en Tunja, Boyacá, Bogotá, Chía y Cajicá con envío contra entrega."),
}

_FAQS = [
    ("¿Qué es un iPhone o celular de exhibición?", "Es un equipo que estuvo en la vitrina de una tienda oficial. Es 100% original, prácticamente nuevo, con mínimo uso y a un precio menor que uno sellado. Todos nuestros equipos de exhibición se revisan y entregan con garantía."),
    ("¿Los iPhone de exhibición son buenos? ¿Son originales?", "Sí. Son equipos originales Apple con la misma calidad de uno nuevo; la diferencia es que ya no traen la caja sellada. Verificamos batería, pantalla, cámaras y funcionamiento antes de venderlos."),
    ("¿Cuánto cuesta un iPhone en Colombia en iSphone?", "El precio depende del modelo, la capacidad (128 GB, 256 GB, 512 GB o 1 TB) y si es nuevo o de exhibición. En cada ficha de producto ves el precio actualizado por capacidad y color; también puedes consultarnos por WhatsApp."),
    ("¿Cómo funciona el Trade-In (entrega tu equipo usado)?", "Traes tu iPhone, Samsung u otro celular actual, lo evaluamos y te damos un descuento sobre tu nuevo equipo. Aceptamos cualquier marca y modelo; el proceso toma menos de 15 minutos."),
    ("¿Hacen envíos y pago contra entrega?", f"Sí. Atendemos en {_CITIES_TEXT}, y enviamos a todo Boyacá y Colombia. En varias zonas puedes recibir el equipo, revisarlo y pagar al recibir."),
    ("¿Reparan iPhone, iPad, MacBook, Apple Watch y Android?", "Sí. Ofrecemos servicio técnico especializado: cambio de pantalla, batería, puerto de carga, cámara, daños por líquidos, software y placa, con repuestos originales y garantía."),
    ("¿Los equipos tienen garantía?", "Todos nuestros equipos, tanto nuevos como de exhibición, incluyen garantía. Cada dispositivo es revisado antes de la venta."),
]

_h = _xml_escape


def _price_cop(text: str) -> Optional[int]:
    digits = re.sub(r"[^\d]", "", text or "")
    return int(digits) if digits else None


def _abs(url: str) -> str:
    if not url:
        return f"{SITE_URL}/images/isphone-logo.webp"
    return url if url.startswith("http") else f"{SITE_URL}/{url.lstrip('/')}"


def _fmt_cop(n: int) -> str:
    return "$" + f"{n:,}".replace(",", ".")


def _html_page(path: str, title: str, description: str, body: str, image: str = "",
               json_ld: Optional[list] = None, og_type: str = "website") -> str:
    full_title = title if "iSphone" in title else f"{title} | iSphone"
    url = f"{SITE_URL}{path}"
    ld = "".join(f'<script type="application/ld+json">{json.dumps(o, ensure_ascii=False)}</script>' for o in (json_ld or []))
    cities = "".join(f"<li>{_h(c)}</li>" for c in SERVICE_CITIES)
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_h(full_title)}</title>
<meta name="description" content="{_h(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{_h(url)}">
<meta property="og:type" content="{og_type}"><meta property="og:site_name" content="iSphone"><meta property="og:locale" content="es_CO">
<meta property="og:url" content="{_h(url)}"><meta property="og:title" content="{_h(full_title)}">
<meta property="og:description" content="{_h(description)}"><meta property="og:image" content="{_h(_abs(image))}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{_h(full_title)}">
<meta name="twitter:description" content="{_h(description)}"><meta name="twitter:image" content="{_h(_abs(image))}">
{ld}</head><body>
<header><a href="{SITE_URL}/">iSphone</a><nav><ul>
<li><a href="{SITE_URL}/catalogo">Catálogo</a></li><li><a href="{SITE_URL}/categoria/iphone">iPhone</a></li>
<li><a href="{SITE_URL}/categoria/android">Samsung y Android</a></li><li><a href="{SITE_URL}/categoria/accesorios">Accesorios</a></li>
<li><a href="{SITE_URL}/reparaciones">Reparaciones</a></li><li><a href="{SITE_URL}/trade-in">Trade-In</a></li>
<li><a href="{SITE_URL}/envios">Envíos</a></li><li><a href="{SITE_URL}/contacto">Contacto</a></li></ul></nav></header>
<main>{body}</main>
<footer><p>iSphone — tienda de tecnología Apple y Android: iPhone, Samsung, iPad, MacBook y accesorios nuevos y de exhibición con garantía.</p>
<p>WhatsApp: <a href="https://wa.me/573186823290">+57 318 682 3290</a> · Instagram: <a href="https://www.instagram.com/isphone_sas">@isphone_sas</a></p>
<h2>Dónde atendemos</h2><ul>{cities}</ul><p>Envíos a todo Boyacá y Colombia.</p></footer>
</body></html>"""


def _product_card(p: dict) -> str:
    return (f'<li><a href="{SITE_URL}{product_path(p)}"><img src="{_h(_abs(p.get("image", "")))}" alt="{_h(p["name"])} {_h(p.get("condition", ""))}" loading="lazy" width="300" height="300">'
            f'<h3>{_h(p["name"])}</h3><p>{_h(p.get("condition", ""))} · {_h(p.get("price_range", ""))}</p></a></li>')


def _breadcrumb_ld(items: list[tuple[str, Optional[str]]]) -> dict:
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": name, **({"item": f"{SITE_URL}{to}"} if to is not None else {})}
        for i, (name, to) in enumerate(items)]}


def _render_home(categories: list, products: list) -> str:
    title, desc, h1 = _STATIC_META[""]
    cats = "".join(f'<li><a href="{SITE_URL}/categoria/{_h(c["slug"])}">{_h(c["name"])}</a></li>' for c in categories)
    featured = [p for p in products if p.get("featured")] or products[:8]
    faq_html = "".join(f"<h3>{_h(q)}</h3><p>{_h(a)}</p>" for q, a in _FAQS)
    body = f"""<h1>{_h(h1)}</h1>
<p>En iSphone vendemos <a href="{SITE_URL}/categoria/iphone">iPhone</a>, <a href="{SITE_URL}/categoria/android">celulares Samsung y Android</a>, iPad, MacBook, computadores portátiles y <a href="{SITE_URL}/categoria/accesorios">accesorios</a>, nuevos y de exhibición, siempre con garantía y con el precio en pesos colombianos visible por capacidad y color.</p>
<p>Un equipo de exhibición es un dispositivo 100% original que estuvo en vitrina: prácticamente nuevo, revisado por nuestros técnicos y a un precio menor que uno sellado.</p>
<p>Además ofrecemos <a href="{SITE_URL}/trade-in">Trade-In</a>, <a href="{SITE_URL}/reparaciones">servicio técnico</a> para iPhone, iPad, Laptop, Apple Watch y Android, y <a href="{SITE_URL}/envios">envíos con pago contra entrega</a> en {_h(_CITIES_TEXT)}.</p>
<h2>Explora por categoría</h2><ul>{cats}</ul>
<h2>Destacados</h2><ul>{"".join(_product_card(p) for p in featured[:8])}</ul>
<h2>Preguntas frecuentes</h2>{faq_html}"""
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in _FAQS]}]
    return _html_page("", title, desc, body, json_ld=ld)


def _render_category(slug: str, categories: list, products: list) -> Optional[str]:
    cat = next((c for c in categories if c.get("slug") == slug), None)
    if not cat:
        return None
    name = cat["name"]
    title, desc = _CATEGORY_META.get(slug, (
        f"{name} nuevos y de exhibición en Tunja, Boyacá y Bogotá",
        f"Compra {name} en iSphone: equipos nuevos y de exhibición con garantía, precio en Colombia y envío contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá."))
    items = [p for p in products if p.get("category") == slug]
    path = f"/categoria/{slug}"
    body = f"""<nav aria-label="Ruta"><a href="{SITE_URL}/">Inicio</a> › <a href="{SITE_URL}/catalogo">Catálogo</a> › {_h(name)}</nav>
<h1>{_h(title)}</h1><p>{_h(desc)}</p>
<ul>{"".join(_product_card(p) for p in items)}</ul>
<p>Trade-In, garantía y contra entrega en {_h(_CITIES_TEXT)}. <a href="{SITE_URL}/reparaciones">Servicio técnico</a> · <a href="{SITE_URL}/trade-in">Trade-In</a> · <a href="{SITE_URL}/envios">Envíos</a></p>"""
    ld = [_breadcrumb_ld([("Inicio", "/"), ("Catálogo", "/catalogo"), (name, None)]),
          {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": f"{SITE_URL}{path}",
           "mainEntity": {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": [
               {"@type": "ListItem", "position": i + 1, "name": p["name"], "url": f"{SITE_URL}{product_path(p)}"}
               for i, p in enumerate(items[:30])]}}]
    return _html_page(path, title, desc, body, image=cat.get("cover_image", ""), json_ld=ld)


def _render_product(pid: int, categories: list, products: list) -> Optional[str]:
    p = next((x for x in products if x.get("id") == pid), None)
    if not p:
        return None
    path = product_path(p)
    exhibition = p.get("condition") == "Exhibición"
    cond = "de exhibición" if exhibition else "nuevo"
    prices = [n for n in (_price_cop(v.get("price", "")) for v in p.get("variants", [])) if n]
    if not prices:
        n = _price_cop(p.get("price_range", ""))
        prices = [n] if n else []
    low, high = (min(prices), max(prices)) if prices else (None, None)
    storage = ", ".join(p.get("storage") or [])
    cat = next((c for c in categories if c.get("slug") == p.get("category")), None)
    title = f"{p['name']} {cond} — precio en Colombia" + (f" desde {_fmt_cop(low)}" if low else "")
    desc = (f"Compra {p['name']} {cond} con garantía en iSphone." + (f" Disponible en {storage}." if storage else "")
            + " Precio actualizado en pesos colombianos, Trade-In y envío contra entrega en Tunja, Boyacá, Bogotá, Chía y Cajicá.")
    images = [p.get("image", "")] + [i for i in p.get("images", []) if i]
    variants = "".join(f"<li>{_h(v.get('storage', ''))} {_h(v.get('color', ''))}: {_h(v.get('price', ''))}</li>" for v in p.get("variants", []))
    crumbs = [("Inicio", "/")] + ([(cat["name"], f"/categoria/{cat['slug']}")] if cat else [("Catálogo", "/catalogo")]) + [(p["name"], None)]
    crumb_html = " › ".join(f'<a href="{SITE_URL}{to}">{_h(n)}</a>' if to else _h(n) for n, to in crumbs)
    body = f"""<nav aria-label="Ruta">{crumb_html}</nav>
<h1>{_h(p['name'])} {cond}</h1>
<img src="{_h(_abs(images[0]))}" alt="{_h(p['name'])} {cond}" width="600" height="600">
<p><strong>{_h(p.get('price_range', ''))}</strong> · {_h(p.get('condition', ''))}</p>
<ul>{variants}</ul>
<p>{_h(desc)}</p>
<p><a href="https://wa.me/573186823290">Consultar disponibilidad por WhatsApp</a> · <a href="{SITE_URL}/trade-in">Trade-In</a> · <a href="{SITE_URL}/reparaciones">Servicio técnico</a></p>"""
    ld = [_breadcrumb_ld(crumbs)]
    if low:
        ld.insert(0, {"@context": "https://schema.org", "@type": "Product", "name": p["name"],
                      "image": [_abs(i) for i in images], "description": desc,
                      "brand": {"@type": "Brand", "name": "Apple" if p.get("brand") == "apple" else p.get("brand", "")},
                      "itemCondition": "https://schema.org/RefurbishedCondition" if exhibition else "https://schema.org/NewCondition",
                      "offers": {"@type": "AggregateOffer", "priceCurrency": "COP", "lowPrice": low, "highPrice": high,
                                 "offerCount": max(len(prices), 1), "availability": "https://schema.org/InStock",
                                 "url": f"{SITE_URL}{path}", "seller": {"@type": "Organization", "name": "iSphone"}}})
    return _html_page(path, title, desc, body, image=images[0], json_ld=ld, og_type="product")


def _render_static(path: str, categories: list, products: list) -> str:
    title, desc, h1 = _STATIC_META[path]
    extra = ""
    if path == "/catalogo":
        extra = "<ul>" + "".join(f'<li><a href="{SITE_URL}/categoria/{_h(c["slug"])}">{_h(c["name"])}</a></li>' for c in categories) + "</ul>"
    elif path == "/destacados":
        extra = "<ul>" + "".join(_product_card(p) for p in products if p.get("featured")) + "</ul>"
    elif path == "/reparaciones":
        extra = ("<p>Arreglamos iPhone, iPad, MacBook y laptops, Apple Watch y celulares Android: cambio de pantalla, reemplazo de batería, puerto de carga, cámara, altavoz y micrófono, daños por agua o humedad, restauración de software y reparación de placa. Repuestos originales y garantía.</p>"
                 f"<p>Atendemos en {_h(_CITIES_TEXT)}.</p>")
    body = f'<nav aria-label="Ruta"><a href="{SITE_URL}/">Inicio</a> › {_h(h1)}</nav><h1>{_h(h1)}</h1><p>{_h(desc)}</p>{extra}'
    return _html_page(path, title, desc, body, json_ld=[_breadcrumb_ld([("Inicio", "/"), (h1, None)])])


@app.get("/api/prerender/{path:path}")
def prerender(path: str = ""):
    route = "/" + path.strip("/")
    if route == "/":
        route = ""
    categories = _ec_load("categories", INITIAL_CATEGORIES)
    products = _ec_load("products", INITIAL_PRODUCTS)
    html: Optional[str] = None
    status = 200
    if route in _STATIC_META:
        html = _render_home(categories, products) if route == "" else _render_static(route, categories, products)
    elif route.startswith("/categoria/"):
        html = _render_category(route.split("/", 2)[2], categories, products)
    elif route.startswith("/producto/"):
        m = re.search(r"(\d+)$", route)
        html = _render_product(int(m.group(1)), categories, products) if m else None
    if html is None:
        status = 404
        html = _html_page(route, "Página no encontrada", "La página que buscas no existe en iSphone.",
                          f'<h1>Página no encontrada</h1><p><a href="{SITE_URL}/">Volver al inicio</a></p>')
    return Response(content=html, status_code=status, media_type="text/html; charset=utf-8",
                    headers={"Cache-Control": "public, max-age=600, s-maxage=3600"})


# --- Site Content ---

@app.get("/api/site-content")
def get_site_content():
    return _ec_load("site_content", DEFAULT_SITE_CONTENT)

@app.put("/api/admin/site-content")
def update_site_content(content: SiteContent, _username: str = Depends(verify_token)):
    data = content.model_dump()
    _ec_save("site_content", data)
    return data


# --- Uploads ---

@app.post("/api/admin/upload-token")
def create_upload_token(body: UploadTokenRequest, _username: str = Depends(verify_token)):
    if not BLOB_TOKEN:
        raise HTTPException(status_code=500, detail="Almacenamiento no configurado")
    safe_name = "".join(c for c in body.filename if c.isalnum() or c in "-_.") or "archivo"
    folder = "images" if body.content_type.startswith("image/") else "videos"
    pathname = f"{folder}/{safe_name}"
    return {
        "token": _client_upload_token(pathname, body.content_type),
        "url": f"https://blob.vercel-storage.com/{pathname}",
        "max_bytes": MAX_UPLOAD_BYTES,
    }

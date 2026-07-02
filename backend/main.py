import hashlib
import secrets
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from pydantic import BaseModel

# Database setup
DATABASE_URL = "sqlite:///./isphone.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    image = Column(String, nullable=False)
    storage = Column(JSON, nullable=False)
    colors = Column(JSON, nullable=False)
    price_range = Column(String, nullable=False)
    badge = Column(String, nullable=True)


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)

# App
app = FastAPI(title="iSphone Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Token store
TOKENS: dict[str, str] = {}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.replace("Bearer ", "")
    if token not in TOKENS:
        raise HTTPException(status_code=401, detail="Token inválido")
    return TOKENS[token]


# Schemas
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

    class Config:
        from_attributes = True


# Create default admin on startup
@app.on_event("startup")
def create_default_admin():
    db = SessionLocal()
    admin = db.query(Admin).first()
    if not admin:
        admin = Admin(username="admin", password_hash=hash_password("isphone2026"))
        db.add(admin)
        db.commit()
    db.close()


# Auth
@app.post("/api/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username).first()
    if not admin or admin.password_hash != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = secrets.token_hex(32)
    TOKENS[token] = admin.username
    return LoginResponse(token=token, username=admin.username)


@app.post("/api/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        TOKENS.pop(token, None)
    return {"ok": True}


@app.post("/api/change-password")
def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin or admin.password_hash != hash_password(old_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    admin.password_hash = hash_password(new_password)
    db.commit()
    return {"ok": True}


# Products (public)
@app.get("/api/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# Products (admin)
@app.post("/api/admin/products", response_model=ProductResponse)
def create_product(
    name: str = Form(...),
    brand: str = Form(...),
    condition: str = Form(...),
    storage: str = Form(...),
    colors: str = Form(...),
    price_range: str = Form(...),
    badge: Optional[str] = Form(None),
    image: UploadFile = File(...),
    _username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    ext = Path(image.filename).suffix if image.filename else ".png"
    filename = f"{secrets.token_hex(8)}{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        shutil.copyfileobj(image.file, f)

    product = Product(
        name=name,
        brand=brand,
        condition=condition,
        image=f"/uploads/products/{filename}",
        storage=storage.split(","),
        colors=colors.split(","),
        price_range=price_range,
        badge=badge if badge else None,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    name: str = Form(...),
    brand: str = Form(...),
    condition: str = Form(...),
    storage: str = Form(...),
    colors: str = Form(...),
    price_range: str = Form(...),
    badge: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    _username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if image and image.filename:
        old_path = Path("." + product.image) if product.image.startswith("/") else Path(product.image)
        if old_path.exists():
            old_path.unlink()
        ext = Path(image.filename).suffix
        filename = f"{secrets.token_hex(8)}{ext}"
        filepath = UPLOAD_DIR / filename
        with open(filepath, "wb") as f:
            shutil.copyfileobj(image.file, f)
        product.image = f"/uploads/products/{filename}"

    product.name = name
    product.brand = brand
    product.condition = condition
    product.storage = storage.split(",")
    product.colors = colors.split(",")
    product.price_range = price_range
    product.badge = badge if badge else None
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/admin/products/{product_id}")
def delete_product(
    product_id: int,
    _username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if product.image:
        img_path = Path("." + product.image) if product.image.startswith("/") else Path(product.image)
        if img_path.exists():
            img_path.unlink()
    db.delete(product)
    db.commit()
    return {"ok": True}

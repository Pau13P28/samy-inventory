import os
import uuid

from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import engine, get_db, Base

# Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API - Sistema de Inventarios SAMY Cosmetics",
    description="API REST para la gestión de productos, movimientos y usuarios del inventario.",
    version="1.0.0",
)

# CORS: en producción, reemplaza "*" por la URL real del frontend desplegado
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def raiz():
    return {"mensaje": "API del sistema de inventarios SAMY Cosmetics activa"}


# ==================== AUTENTICACIÓN ====================
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = crud.autenticar_usuario(db, datos.correo, datos.contrasena)
    # Token simple de demostración (no usar así en producción real; para
    # una implementación robusta se recomienda JWT con expiración).
    token = str(uuid.uuid4())
    return {"token": token, "usuario": usuario}


# ==================== PRODUCTOS ====================
@app.get("/api/productos", response_model=list[schemas.ProductoOut])
def obtener_productos(
    buscar: str | None = Query(default=None),
    id_categoria: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.listar_productos(db, buscar=buscar, id_categoria=id_categoria)


@app.post("/api/productos", response_model=schemas.ProductoOut, status_code=201)
def registrar_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    return crud.crear_producto(db, producto)


@app.get("/api/productos/{id_producto}", response_model=schemas.ProductoOut)
def obtener_producto_por_id(id_producto: int, db: Session = Depends(get_db)):
    return crud.obtener_producto(db, id_producto)


@app.put("/api/productos/{id_producto}", response_model=schemas.ProductoOut)
def actualizar_producto(id_producto: int, cambios: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    return crud.actualizar_producto(db, id_producto, cambios)


@app.delete("/api/productos/{id_producto}")
def eliminar_producto(id_producto: int, db: Session = Depends(get_db)):
    crud.eliminar_producto(db, id_producto)
    return {"mensaje": "Producto eliminado correctamente"}


# ==================== MOVIMIENTOS ====================
@app.get("/api/movimientos", response_model=list[schemas.MovimientoOut])
def obtener_movimientos(
    id_producto: int | None = Query(default=None),
    tipo_movimiento: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.listar_movimientos(db, id_producto=id_producto, tipo_movimiento=tipo_movimiento)


@app.post("/api/movimientos", response_model=schemas.MovimientoOut, status_code=201)
def registrar_movimiento(movimiento: schemas.MovimientoCreate, db: Session = Depends(get_db)):
    return crud.crear_movimiento(db, movimiento)


@app.get("/api/movimientos/{id_movimiento}", response_model=schemas.MovimientoOut)
def obtener_movimiento_por_id(id_movimiento: int, db: Session = Depends(get_db)):
    return crud.obtener_movimiento(db, id_movimiento)


# ==================== USUARIOS ====================
@app.get("/api/usuarios", response_model=list[schemas.UsuarioOut])
def obtener_usuarios(db: Session = Depends(get_db)):
    return crud.listar_usuarios(db)


@app.post("/api/usuarios", response_model=schemas.UsuarioOut, status_code=201)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return crud.crear_usuario(db, usuario)


@app.put("/api/usuarios/{id_usuario}/estado", response_model=schemas.UsuarioOut)
def cambiar_estado_usuario(id_usuario: int, datos: schemas.UsuarioEstadoUpdate, db: Session = Depends(get_db)):
    return crud.actualizar_estado_usuario(db, id_usuario, datos.estado)


# ==================== CATEGORIAS ====================
@app.get("/api/categorias", response_model=list[schemas.CategoriaOut])
def obtener_categorias(db: Session = Depends(get_db)):
    return crud.listar_categorias(db)


@app.post("/api/categorias", response_model=schemas.CategoriaOut, status_code=201)
def registrar_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    return crud.crear_categoria(db, categoria)

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from passlib.context import CryptContext

import models
import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ================= USUARIOS =================
def crear_usuario(db: Session, usuario: schemas.UsuarioCreate) -> models.Usuario:
    existente = db.query(models.Usuario).filter(models.Usuario.correo == usuario.correo).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")

    nuevo = models.Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo=usuario.correo,
        contrasena_hash=pwd_context.hash(usuario.contrasena),
        rol=usuario.rol,
        estado=True,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def listar_usuarios(db: Session):
    return db.query(models.Usuario).all()


def actualizar_estado_usuario(db: Session, id_usuario: int, estado: bool) -> models.Usuario:
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.estado = estado
    db.commit()
    db.refresh(usuario)
    return usuario


def autenticar_usuario(db: Session, correo: str, contrasena: str) -> models.Usuario:
    usuario = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
    if not usuario or not pwd_context.verify(contrasena, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    if not usuario.estado:
        raise HTTPException(status_code=403, detail="El usuario se encuentra deshabilitado")
    return usuario


# ================= CATEGORIAS =================
def crear_categoria(db: Session, categoria: schemas.CategoriaCreate) -> models.Categoria:
    existente = db.query(models.Categoria).filter(models.Categoria.nombre == categoria.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    nueva = models.Categoria(**categoria.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


def listar_categorias(db: Session):
    return db.query(models.Categoria).all()


# ================= PRODUCTOS =================
def crear_producto(db: Session, producto: schemas.ProductoCreate) -> models.Producto:
    existente = db.query(models.Producto).filter(models.Producto.codigo == producto.codigo).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")

    if producto.id_categoria is not None:
        categoria = db.query(models.Categoria).filter(
            models.Categoria.id_categoria == producto.id_categoria
        ).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="La categoría indicada no existe")

    nuevo = models.Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def listar_productos(db: Session, buscar: str | None = None, id_categoria: int | None = None):
    query = db.query(models.Producto).filter(models.Producto.activo == True)  # noqa: E712
    if buscar:
        like = f"%{buscar}%"
        query = query.filter(or_(models.Producto.nombre.ilike(like), models.Producto.codigo.ilike(like)))
    if id_categoria:
        query = query.filter(models.Producto.id_categoria == id_categoria)
    return query.all()


def obtener_producto(db: Session, id_producto: int) -> models.Producto:
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def actualizar_producto(db: Session, id_producto: int, cambios: schemas.ProductoUpdate) -> models.Producto:
    producto = obtener_producto(db, id_producto)

    datos = cambios.model_dump(exclude_unset=True)

    if "codigo" in datos and datos["codigo"] != producto.codigo:
        duplicado = db.query(models.Producto).filter(models.Producto.codigo == datos["codigo"]).first()
        if duplicado:
            raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")

    if "id_categoria" in datos and datos["id_categoria"] is not None:
        categoria = db.query(models.Categoria).filter(
            models.Categoria.id_categoria == datos["id_categoria"]
        ).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="La categoría indicada no existe")

    for campo, valor in datos.items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


def eliminar_producto(db: Session, id_producto: int) -> None:
    producto = obtener_producto(db, id_producto)
    # Eliminación lógica para conservar el historial de movimientos asociados
    producto.activo = False
    db.commit()


# ================= MOVIMIENTOS =================
def crear_movimiento(db: Session, movimiento: schemas.MovimientoCreate) -> models.Movimiento:
    producto = db.query(models.Producto).filter(
        models.Producto.id_producto == movimiento.id_producto
    ).first()
    if not producto or not producto.activo:
        raise HTTPException(status_code=404, detail="El producto indicado no existe")

    usuario = db.query(models.Usuario).filter(
        models.Usuario.id_usuario == movimiento.id_usuario
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="El usuario indicado no existe")

    if movimiento.cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor que cero")

    if movimiento.tipo_movimiento == "salida":
        if producto.stock < movimiento.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Stock disponible: {producto.stock}",
            )
        producto.stock -= movimiento.cantidad
    elif movimiento.tipo_movimiento in ("entrada", "devolucion"):
        producto.stock += movimiento.cantidad
    else:
        raise HTTPException(status_code=400, detail="Tipo de movimiento no válido")

    nuevo = models.Movimiento(
        tipo_movimiento=movimiento.tipo_movimiento,
        cantidad=movimiento.cantidad,
        observaciones=movimiento.observaciones,
        id_usuario=movimiento.id_usuario,
        id_producto=movimiento.id_producto,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def listar_movimientos(
    db: Session,
    id_producto: int | None = None,
    tipo_movimiento: str | None = None,
):
    query = db.query(models.Movimiento)
    if id_producto:
        query = query.filter(models.Movimiento.id_producto == id_producto)
    if tipo_movimiento:
        query = query.filter(models.Movimiento.tipo_movimiento == tipo_movimiento)
    return query.order_by(models.Movimiento.fecha.desc()).all()


def obtener_movimiento(db: Session, id_movimiento: int) -> models.Movimiento:
    movimiento = db.query(models.Movimiento).filter(
        models.Movimiento.id_movimiento == id_movimiento
    ).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return movimiento

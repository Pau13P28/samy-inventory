import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Usuario ----------
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: EmailStr
    rol: Literal["administrador", "supervisor", "comercial", "auxiliar"]


class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(min_length=6)


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    id_usuario: int
    estado: bool


class UsuarioEstadoUpdate(BaseModel):
    estado: bool


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioOut


# ---------- Categoria ----------
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    id_categoria: int


# ---------- Producto ----------
class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    precio: float = Field(ge=0, description="El precio no puede ser negativo")
    stock: int = Field(ge=0, description="El stock no puede ser negativo")
    stock_minimo: int = Field(ge=0, default=0)
    id_categoria: Optional[int] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(default=None, ge=0)
    stock_minimo: Optional[int] = Field(default=None, ge=0)
    id_categoria: Optional[int] = None
    activo: Optional[bool] = None
    # El stock NO se edita directamente aquí: solo se modifica mediante movimientos


class ProductoOut(ProductoBase):
    model_config = ConfigDict(from_attributes=True)
    id_producto: int
    fecha_creacion: datetime.datetime
    activo: bool


# ---------- Movimiento ----------
class MovimientoBase(BaseModel):
    tipo_movimiento: Literal["entrada", "salida", "devolucion"]
    cantidad: int = Field(gt=0, description="La cantidad debe ser mayor que cero")
    observaciones: Optional[str] = None
    id_producto: int


class MovimientoCreate(MovimientoBase):
    id_usuario: int


class MovimientoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_movimiento: int
    tipo_movimiento: str
    cantidad: int
    fecha: datetime.datetime
    observaciones: Optional[str] = None
    id_usuario: int
    id_producto: int

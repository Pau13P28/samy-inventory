import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(150), unique=True, nullable=False, index=True)
    contrasena_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)  # administrador, supervisor, comercial, auxiliar
    estado = Column(Boolean, default=True)

    movimientos = relationship("Movimiento", back_populates="usuario")


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)

    productos = relationship("Producto", back_populates="categoria")


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(255), nullable=True)
    precio = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=0)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)
    activo = Column(Boolean, default=True)

    categoria = relationship("Categoria", back_populates="productos")
    movimientos = relationship("Movimiento", back_populates="producto")


class Movimiento(Base):
    __tablename__ = "movimientos"

    id_movimiento = Column(Integer, primary_key=True, index=True)
    tipo_movimiento = Column(String(20), nullable=False)  # entrada, salida, devolucion
    cantidad = Column(Integer, nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    observaciones = Column(Text, nullable=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)

    usuario = relationship("Usuario", back_populates="movimientos")
    producto = relationship("Producto", back_populates="movimientos")

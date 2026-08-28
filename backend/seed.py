"""
Script para poblar la base de datos con datos iniciales de prueba.
Ejecutar una sola vez con:  python seed.py
"""
from database import SessionLocal, engine, Base
import models
import crud
import schemas

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ---- Usuario administrador ----
    if not db.query(models.Usuario).filter(models.Usuario.correo == "admin@samy.com").first():
        crud.crear_usuario(db, schemas.UsuarioCreate(
            nombre="Ana", apellido="García", correo="admin@samy.com",
            rol="administrador", contrasena="admin123",
        ))
        print("Usuario administrador creado: admin@samy.com / admin123")

    # ---- Categorías ----
    nombres_categorias = ["Labiales", "Ojos", "Rostro", "Accesorios"]
    categorias = {}
    for nombre in nombres_categorias:
        cat = db.query(models.Categoria).filter(models.Categoria.nombre == nombre).first()
        if not cat:
            cat = crud.crear_categoria(db, schemas.CategoriaCreate(nombre=nombre, descripcion=f"Categoría {nombre}"))
        categorias[nombre] = cat.id_categoria

    # ---- Productos ----
    productos_demo = [
        ("LAB001", "Labial Mate 01", "Labiales", 24900, 120, 20),
        ("SOM001", "Sombra Natural", "Ojos", 32900, 65, 15),
        ("BAS001", "Base Líquida 30ml", "Rostro", 39900, 90, 20),
        ("BRO001", "Brocha Maquillaje", "Accesorios", 22900, 25, 10),
    ]
    for codigo, nombre, cat_nombre, precio, stock, stock_min in productos_demo:
        if not db.query(models.Producto).filter(models.Producto.codigo == codigo).first():
            crud.crear_producto(db, schemas.ProductoCreate(
                codigo=codigo, nombre=nombre, precio=precio, stock=stock,
                stock_minimo=stock_min, id_categoria=categorias[cat_nombre],
            ))

    print("Datos de prueba cargados correctamente.")
finally:
    db.close()

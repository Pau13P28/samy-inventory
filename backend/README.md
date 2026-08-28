# Backend — API de Inventarios SAMY Cosmetics

API REST construida con **FastAPI** + **SQLAlchemy**, siguiendo el diseño del
Momento 2 (endpoints, modelo de datos y reglas de negocio).

## 1. Ejecutar en local

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate

pip install -r requirements.txt

# (opcional pero recomendado) copia el archivo de variables de entorno
cp .env.example .env

# crea las tablas y carga un usuario admin + productos de prueba
python seed.py

# levanta el servidor
uvicorn main:app --reload
```

La API queda disponible en `http://localhost:8000`.
Documentación interactiva automática (Swagger): `http://localhost:8000/docs`.

Usuario de prueba creado por `seed.py`:
- correo: `admin@samy.com`
- contraseña: `admin123`

## 2. Probar los endpoints (Postman / Thunder Client)

Importa el archivo `SAMY_Inventario.postman_collection.json` en Postman
(Import → File). Contiene solicitudes listas para:

- Login
- CRUD de productos
- Registro de movimientos (incluye un caso que **debe fallar** por stock
  insuficiente, para comprobar la validación)
- Usuarios y categorías

Reglas de negocio implementadas (verificables desde la colección):
- No se permiten cantidades negativas ni cero en movimientos (`cantidad > 0`).
- No se permite registrar una **salida** mayor al stock disponible (error 400
  con el stock disponible en el mensaje).
- No se permite registrar un movimiento sobre un producto o usuario
  inexistente (error 404).
- No se permiten productos duplicados por código (error 400).
- El stock **solo** se modifica a través de movimientos, nunca editando el
  producto directamente (así se conserva la trazabilidad).

## 3. Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/productos | Listar productos (filtros: `buscar`, `id_categoria`) |
| POST | /api/productos | Registrar producto |
| GET | /api/productos/{id} | Obtener producto por ID |
| PUT | /api/productos/{id} | Actualizar producto |
| DELETE | /api/productos/{id} | Eliminar producto (baja lógica) |
| GET | /api/movimientos | Listar movimientos (filtros: `id_producto`, `tipo_movimiento`) |
| POST | /api/movimientos | Registrar movimiento (actualiza el stock) |
| GET | /api/movimientos/{id} | Obtener movimiento por ID |
| GET | /api/usuarios | Listar usuarios |
| POST | /api/usuarios | Crear usuario |
| PUT | /api/usuarios/{id}/estado | Activar/desactivar usuario |
| GET | /api/categorias | Listar categorías |
| POST | /api/categorias | Crear categoría |

## 4. Base de datos

Por defecto usa **SQLite** (`samy.db`, se crea solo). Si prefieres
PostgreSQL, define `DATABASE_URL` en `.env`, por ejemplo:

```
DATABASE_URL=postgresql://usuario:clave@host:5432/samy_db
```

y agrega `psycopg2-binary` a `requirements.txt`.

## 5. Despliegue en Render (recomendado) o Railway

**Render:**
1. Sube este proyecto a un repositorio de GitHub.
2. En Render → New → Web Service → conecta el repo, selecciona la carpeta
   `backend` como *root directory*.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   (o deja que Render use el `Procfile` incluido).
5. Agrega la variable de entorno `CORS_ORIGINS` con la URL de tu frontend
   desplegado (ej. `https://samy-inventario.netlify.app`).
6. Si usas PostgreSQL gestionado por Render, agrega también `DATABASE_URL`.
7. Despliega y verifica `https://tu-servicio.onrender.com/docs`.

**Railway:** el proceso es equivalente — crea un servicio desde el repo,
define las mismas variables de entorno y el mismo *start command*.

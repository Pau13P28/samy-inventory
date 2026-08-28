# Frontend — SAMY Cosmetics (React + Vite)

Interfaz web que consume la API del backend mediante `axios`.

## 1. Ejecutar en local

**Importante:** primero debe estar corriendo el backend (`uvicorn main:app --reload`
en `http://localhost:8000`).

```bash
cd frontend
npm install

cp .env.example .env
# revisa que VITE_API_URL apunte a tu backend (http://localhost:8000 por defecto)

npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con:
- correo: `admin@samy.com`
- contraseña: `admin123`

## 2. Pantallas incluidas

- **Login**: autenticación contra `/api/auth/login`.
- **Dashboard**: totales, alertas de stock bajo y últimos movimientos.
- **Productos**: listar, buscar, crear, editar y eliminar (CRUD completo).
- **Movimientos**: registrar entradas/salidas/devoluciones e historial
  completo, con manejo de errores (stock insuficiente, producto inexistente)
  y mensajes de confirmación.

## 3. Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` lista para desplegar.

## 4. Despliegue en Vercel o Netlify

**Netlify:**
1. Sube el proyecto a GitHub.
2. New site from Git → selecciona el repo → *base directory*: `frontend`.
3. Build command: `npm run build` — Publish directory: `frontend/dist`.
4. Variables de entorno: agrega `VITE_API_URL` con la URL de tu backend
   desplegado (ej. `https://samy-inventario-api.onrender.com`).
5. Deploy.

**Vercel:**
1. Import Project desde GitHub, root directory `frontend`.
2. Framework preset: Vite (se detecta automáticamente).
3. Agrega la variable de entorno `VITE_API_URL`.
4. Deploy.

Después de desplegar, vuelve al backend y actualiza `CORS_ORIGINS` con la
URL final del frontend para que las peticiones no sean bloqueadas.

# Sistema de Inventarios — SAMY Cosmetics

Implementación completa del diseño técnico presentado en el Momento 2:
API REST (FastAPI) + frontend web (React/Vite) + base de datos + guía de
pruebas y despliegue.

```
samy-inventory/
├── backend/     → API REST (FastAPI + SQLAlchemy + SQLite)
├── frontend/    → Interfaz web (React + Vite + axios)
```

## Cómo cumplir cada paso del evento evaluativo

### 1. Backend (API REST) ✅
Ya implementado en `backend/`. Incluye:
- CRUD completo de productos (`/api/productos`).
- Endpoints de movimientos con actualización automática de stock
  (`/api/movimientos`).
- Validaciones de reglas de negocio: cantidades negativas o cero
  rechazadas, verificación de stock disponible antes de una salida,
  verificación de existencia de producto/usuario.
- Base de datos SQLite lista de inmediato (o PostgreSQL cambiando una
  variable de entorno).
- Colección de Postman incluida (`backend/SAMY_Inventario.postman_collection.json`)
  para probar cada endpoint.

👉 Instrucciones detalladas: `backend/README.md`

### 2. Frontend (Web) ✅
Ya implementado en `frontend/` con React + Vite:
- Lista de productos (con búsqueda, crear/editar/eliminar).
- Registro de entradas y salidas.
- Visualización del stock actualizado en tiempo real (Dashboard).
- Conexión a la API mediante `axios` (`frontend/src/api.js`).

👉 Instrucciones detalladas: `frontend/README.md`

### 3. Integración completa
Para probarla en tu máquina:
1. Levanta el backend (`uvicorn main:app --reload`).
2. Levanta el frontend (`npm run dev`).
3. Inicia sesión, registra un movimiento y confirma que el stock del
   producto cambia en la tabla de Productos y en el Dashboard.
4. Prueba casos de error a propósito: registra una salida con una cantidad
   mayor al stock disponible y verifica que aparece el mensaje de error
   ("Stock insuficiente...") en la interfaz, sin romper la aplicación.

### 4. Pruebas funcionales
Checklist sugerido para tu informe/evidencias (captura de pantalla de cada
punto):
- [ ] Registrar un producto nuevo desde el frontend y verlo en la lista.
- [ ] Registrar una entrada → el stock aumenta.
- [ ] Registrar una salida → el stock disminuye.
- [ ] Intentar una salida mayor al stock → el sistema la rechaza y muestra
      el error.
- [ ] Editar un producto (nombre, precio) y confirmar el cambio.
- [ ] Eliminar un producto y confirmar que desaparece de la lista.
- [ ] Revisar el historial de movimientos y confirmar que quedó registrado
      quién y cuándo hizo cada movimiento.
- [ ] Navegar entre Dashboard, Productos y Movimientos sin errores.

### 5. Despliegue
- Backend en **Render** o **Railway** (guía en `backend/README.md`).
- Frontend en **Netlify** o **Vercel** (guía en `frontend/README.md`).
- Al final, verifica en un navegador (no en localhost) que:
  - La URL del frontend carga correctamente.
  - Puedes iniciar sesión y ver los productos (esto confirma que el
    frontend está hablando con el backend desplegado).
  - `https://tu-backend.onrender.com/docs` responde con la documentación
    Swagger de la API.

## Nota sobre la base de datos

En el informe del Momento 2 se había propuesto MongoDB, pero en el análisis
comparativo final ustedes mismos concluyeron que **PostgreSQL** ofrece
mayor integridad para este tipo de sistema. Por simplicidad y velocidad de
implementación, el backend usa **SQLite** por defecto (cero configuración,
perfecto para desarrollo y para la sustentación), pero está preparado para
cambiar a PostgreSQL en producción con solo definir la variable de entorno
`DATABASE_URL` — no se necesita tocar el código.

## Limitaciones conocidas (igual que en la bitácora técnica del Momento 2)

- El login genera un token simple de demostración, no un JWT con expiración
  real. Para un sistema en producción se recomendaría añadir JWT y
  refresh tokens.
- No hay pruebas automatizadas (unitarias) incluidas; las pruebas descritas
  en este README son manuales, tal como pide la guía de la actividad.

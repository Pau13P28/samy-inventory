import { useEffect, useState } from 'react'
import api, { extraerError } from '../api.js'

export default function Movimientos({ usuario }) {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [tipo, setTipo] = useState('entrada')
  const [idProducto, setIdProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cargarTodo() {
    setCargando(true)
    try {
      const [resProductos, resMovimientos] = await Promise.all([
        api.get('/api/productos'),
        api.get('/api/movimientos'),
      ])
      setProductos(resProductos.data)
      setMovimientos(resMovimientos.data)
    } catch (err) {
      setError(extraerError(err))
    } finally {
      setCargando(false)
    }
  }

  async function registrarMovimiento(e) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idProducto) {
      setError('Selecciona un producto.')
      return
    }
    if (Number(cantidad) <= 0) {
      setError('La cantidad debe ser mayor que cero.')
      return
    }

    setEnviando(true)
    try {
      await api.post('/api/movimientos', {
        tipo_movimiento: tipo,
        cantidad: Number(cantidad),
        observaciones,
        id_producto: Number(idProducto),
        id_usuario: usuario.id_usuario,
      })
      setMensaje('Movimiento registrado. El stock se actualizó correctamente.')
      setCantidad('')
      setObservaciones('')
      await cargarTodo()
    } catch (err) {
      setError(extraerError(err))
    } finally {
      setEnviando(false)
    }
  }

  const productoSeleccionado = productos.find((p) => p.id_producto === Number(idProducto))

  return (
    <div>
      <header className="page-header">
        <h1>Movimientos de inventario</h1>
        <p>Registra entradas, salidas y devoluciones de productos</p>
      </header>

      <div className="grid-2">
        <section className="panel">
          <h2>Nuevo movimiento</h2>
          <form className="formulario" onSubmit={registrarMovimiento}>
            <label>Tipo de movimiento</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="entrada">Entrada (aumenta el stock)</option>
              <option value="salida">Salida (disminuye el stock)</option>
              <option value="devolucion">Devolución (aumenta el stock)</option>
            </select>

            <label>Producto</label>
            <select value={idProducto} onChange={(e) => setIdProducto(e.target.value)} required>
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} (stock actual: {p.stock})
                </option>
              ))}
            </select>

            {productoSeleccionado && tipo === 'salida' && (
              <p className="texto-ayuda">Stock disponible: {productoSeleccionado.stock}</p>
            )}

            <label>Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 50"
              required
            />

            <label>Observaciones (opcional)</label>
            <input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escribe una observación"
            />

            {error && <div className="alerta alerta-error">{error}</div>}
            {mensaje && <div className="alerta alerta-exito">{mensaje}</div>}

            <div className="formulario-acciones">
              <button type="button" className="btn-secundario" onClick={() => {
                setCantidad('')
                setObservaciones('')
                setError('')
              }}>
                Limpiar
              </button>
              <button type="submit" className="btn-primario" disabled={enviando}>
                {enviando ? 'Guardando...' : 'Guardar movimiento'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel panel-info">
          <h2>Información del movimiento</h2>
          <p>Las entradas y devoluciones aumentan el stock; las salidas lo disminuyen automáticamente.</p>
          <p>Si intentas registrar una salida mayor al stock disponible, el sistema la rechazará.</p>
        </section>
      </div>

      <section className="panel">
        <h2>Historial de movimientos</h2>
        {cargando ? (
          <p>Cargando historial...</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id_movimiento}>
                  <td>{new Date(m.fecha).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${m.tipo_movimiento}`}>{m.tipo_movimiento}</span>
                  </td>
                  <td>{productos.find((p) => p.id_producto === m.id_producto)?.nombre || m.id_producto}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.observaciones || '—'}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={5}>Aún no se han registrado movimientos.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

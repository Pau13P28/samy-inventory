import { useEffect, useState } from 'react'
import api, { extraerError } from '../api.js'

export default function Dashboard() {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    setError('')
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

  const totalProductos = productos.length
  const totalUnidades = productos.reduce((acc, p) => acc + p.stock, 0)
  const stockBajo = productos.filter((p) => p.stock <= p.stock_minimo)
  const movimientosHoy = movimientos.filter((m) => {
    const fecha = new Date(m.fecha)
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  })

  return (
    <div>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen general del inventario en tiempo real</p>
      </header>

      {cargando && <p>Cargando información...</p>}
      {error && <div className="alerta alerta-error">{error}</div>}

      {!cargando && !error && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-valor">{totalProductos}</span>
              <span className="kpi-label">Total productos</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-valor">{stockBajo.length}</span>
              <span className="kpi-label">Stock bajo</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-valor">{movimientosHoy.length}</span>
              <span className="kpi-label">Movimientos hoy</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-valor">{totalUnidades}</span>
              <span className="kpi-label">Unidades en inventario</span>
            </div>
          </div>

          {stockBajo.length > 0 && (
            <div className="alerta alerta-aviso">
              {stockBajo.length} producto(s) con stock igual o por debajo del mínimo:{' '}
              {stockBajo.map((p) => p.nombre).join(', ')}
            </div>
          )}

          <section className="panel">
            <h2>Últimos movimientos</h2>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.slice(0, 8).map((m) => (
                  <tr key={m.id_movimiento}>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${m.tipo_movimiento}`}>{m.tipo_movimiento}</span>
                    </td>
                    <td>
                      {productos.find((p) => p.id_producto === m.id_producto)?.nombre || m.id_producto}
                    </td>
                    <td>{m.cantidad}</td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={4}>Aún no se han registrado movimientos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}

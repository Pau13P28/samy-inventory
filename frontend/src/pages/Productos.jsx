import { useEffect, useState } from 'react'
import api, { extraerError } from '../api.js'

const FORM_VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  stock_minimo: '',
  id_categoria: '',
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [buscar, setBuscar] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cargarTodo() {
    setCargando(true)
    try {
      const [resProductos, resCategorias] = await Promise.all([
        api.get('/api/productos'),
        api.get('/api/categorias'),
      ])
      setProductos(resProductos.data)
      setCategorias(resCategorias.data)
    } catch (err) {
      setError(extraerError(err))
    } finally {
      setCargando(false)
    }
  }

  async function buscarProductos(e) {
    e.preventDefault()
    try {
      const { data } = await api.get('/api/productos', { params: { buscar } })
      setProductos(data)
    } catch (err) {
      setError(extraerError(err))
    }
  }

  function abrirNuevoProducto() {
    setForm(FORM_VACIO)
    setEditandoId(null)
    setMostrarForm(true)
    setError('')
  }

  function abrirEdicion(producto) {
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      id_categoria: producto.id_categoria || '',
    })
    setEditandoId(producto.id_producto)
    setMostrarForm(true)
    setError('')
  }

  async function guardarProducto(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      if (editandoId) {
        // El stock no se edita aquí: solo se modifica mediante movimientos
        const { codigo, nombre, descripcion, precio, stock_minimo, id_categoria } = form
        await api.put(`/api/productos/${editandoId}`, {
          codigo,
          nombre,
          descripcion,
          precio: Number(precio),
          stock_minimo: Number(stock_minimo),
          id_categoria: id_categoria ? Number(id_categoria) : null,
        })
        setMensaje('Producto actualizado correctamente.')
      } else {
        await api.post('/api/productos', {
          ...form,
          precio: Number(form.precio),
          stock: Number(form.stock),
          stock_minimo: Number(form.stock_minimo || 0),
          id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
        })
        setMensaje('Producto registrado correctamente.')
      }
      setMostrarForm(false)
      await cargarTodo()
    } catch (err) {
      setError(extraerError(err))
    }
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setError('')
    try {
      await api.delete(`/api/productos/${id}`)
      setMensaje('Producto eliminado.')
      await cargarTodo()
    } catch (err) {
      setError(extraerError(err))
    }
  }

  return (
    <div>
      <header className="page-header page-header-flex">
        <div>
          <h1>Productos</h1>
          <p>Gestiona el catálogo de productos de SAMY Cosmetics</p>
        </div>
        <button className="btn-primario" onClick={abrirNuevoProducto}>
          + Nuevo producto
        </button>
      </header>

      <form className="barra-busqueda" onSubmit={buscarProductos}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <button type="submit" className="btn-secundario">Buscar</button>
      </form>

      {error && <div className="alerta alerta-error">{error}</div>}
      {mensaje && <div className="alerta alerta-exito">{mensaje}</div>}

      {mostrarForm && (
        <div className="panel-modal">
          <form className="formulario" onSubmit={guardarProducto}>
            <h2>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h2>

            <label>Código</label>
            <input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              required
            />

            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <label>Descripción</label>
            <input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <label>Categoría</label>
            <select
              value={form.id_categoria}
              onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label>Precio</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />

            {!editandoId && (
              <>
                <label>Stock inicial</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </>
            )}

            <label>Stock mínimo</label>
            <input
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
            />

            <div className="formulario-acciones">
              <button type="button" className="btn-secundario" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primario">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id_producto}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{categorias.find((c) => c.id_categoria === p.id_categoria)?.nombre || '—'}</td>
                <td>${p.precio.toLocaleString('es-CO')}</td>
                <td>
                  <span className={p.stock <= p.stock_minimo ? 'stock-bajo' : 'stock-ok'}>
                    {p.stock}
                  </span>
                </td>
                <td className="acciones">
                  <button className="btn-icono" onClick={() => abrirEdicion(p)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-icono" onClick={() => eliminarProducto(p.id_producto)} title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6}>No se encontraron productos.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

import { NavLink } from 'react-router-dom'

export default function Layout({ usuario, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>SAMY</span>
          <small>COSMETICS</small>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/movimientos">Movimientos</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{usuario.nombre} {usuario.apellido}</strong>
            <span>{usuario.rol}</span>
          </div>
          <button className="btn-secundario" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}

import { useState } from 'react'
import api, { extraerError } from '../api.js'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('admin@samy.com')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const { data } = await api.post('/api/auth/login', { correo, contrasena })
      onLogin(data.usuario, data.token)
    } catch (err) {
      setError(extraerError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-title">SAMY</span>
          <span className="login-brand-sub">COSMETICS</span>
        </div>
        <h1>Bienvenida</h1>
        <p className="login-hint">Ingresa tus datos para continuar</p>

        <form onSubmit={manejarEnvio}>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@samy.com"
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <div className="alerta alerta-error">{error}</div>}

          <button type="submit" className="btn-primario" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-nota">
          Usuario de prueba: <strong>admin@samy.com</strong> / <strong>admin123</strong>
          <br />
          (creado al ejecutar <code>python seed.py</code> en el backend)
        </p>
      </div>
    </div>
  )
}

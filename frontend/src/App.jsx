import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Productos from './pages/Productos.jsx'
import Movimientos from './pages/Movimientos.jsx'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const guardado = localStorage.getItem('samy_usuario')
    if (guardado) setUsuario(JSON.parse(guardado))
    setCargando(false)
  }, [])

  function iniciarSesion(datosUsuario, token) {
    localStorage.setItem('samy_usuario', JSON.stringify(datosUsuario))
    localStorage.setItem('samy_token', token)
    setUsuario(datosUsuario)
  }

  function cerrarSesion() {
    localStorage.removeItem('samy_usuario')
    localStorage.removeItem('samy_token')
    setUsuario(null)
  }

  if (cargando) return null

  if (!usuario) {
    return <Login onLogin={iniciarSesion} />
  }

  return (
    <Layout usuario={usuario} onLogout={cerrarSesion}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/movimientos" element={<Movimientos usuario={usuario} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL })

// Helper para extraer un mensaje de error legible desde la respuesta de FastAPI
export function extraerError(error) {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((d) => d.msg).join(', ')
    }
    return error.response.data.detail
  }
  return 'Ocurrió un error inesperado. Verifica tu conexión con el servidor.'
}

export default api

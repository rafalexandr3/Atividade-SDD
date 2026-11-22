import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/auth-context'
import { ProtectedRoute } from './auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import PagesPage from './pages/PagesPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function PublicOnlyRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PagesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

export default function PagesPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pages-layout">
      <header className="app-header">
        <p className="brand">App de Anotações</p>
        <div className="app-header-user">
          <span className="user-name">{user.name}</span>
          <button className="ghost-button" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="pages-main">
        <h1>Suas páginas</h1>
        <p className="pages-greeting">Olá, {user.name}.</p>
        <section className="empty-state" aria-labelledby="pages-empty-title">
          <h2 id="pages-empty-title">Área de páginas</h2>
          <p>
            Em breve você poderá criar e organizar suas notas e checklists aqui.
          </p>
        </section>
      </main>
    </div>
  )
}

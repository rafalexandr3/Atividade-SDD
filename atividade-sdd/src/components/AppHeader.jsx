import { Link } from 'react-router-dom'

export function AppHeader({ userName, onLogout }) {
  return (
    <header className="app-header">
      <p className="brand">App de Anotações</p>
      <div className="app-header-user">
        <span className="user-name">{userName}</span>
        {onLogout ? (
          <button className="ghost-button" type="button" onClick={onLogout}>
            Sair
          </button>
        ) : (
          <Link className="ghost-button" to="/">
            Suas páginas
          </Link>
        )}
      </div>
    </header>
  )
}

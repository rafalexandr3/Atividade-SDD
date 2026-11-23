import { Link } from 'react-router-dom'

export function LoadingState({ message }) {
  return (
    <p className="page-status" role="status">
      {message}
    </p>
  )
}

export function NotFoundState() {
  return (
    <section className="not-found" aria-labelledby="page-not-found-title">
      <h1 id="page-not-found-title">Página não encontrada</h1>
      <p>Esta página não existe ou não pertence à sua conta.</p>
      <div className="not-found-actions">
        <Link className="primary-action" to="/">
          Voltar para suas páginas
        </Link>
      </div>
    </section>
  )
}

export function LoadErrorState({ message, onRetry, withBackLink = false }) {
  const retryButton = (
    <button className="secondary-action" type="button" onClick={onRetry}>
      Tentar novamente
    </button>
  )

  return (
    <div className="page-load-error">
      <p className="form-error" role="alert">
        {message}
      </p>
      {withBackLink ? (
        <div className="editor-actions">
          {retryButton}
          <Link className="secondary-action" to="/">
            Voltar para suas páginas
          </Link>
        </div>
      ) : (
        retryButton
      )}
    </div>
  )
}

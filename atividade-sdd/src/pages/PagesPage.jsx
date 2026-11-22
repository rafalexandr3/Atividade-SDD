import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listByUser, remove } from '../api/pages'
import { useAuth } from '../auth/auth-context'

export default function PagesPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const confirmButtonRef = useRef(null)
  const deleteButtonRefs = useRef(new Map())
  const pendingFocusIdRef = useRef(null)

  useEffect(() => {
    if (confirmingId !== null) {
      confirmButtonRef.current?.focus()
      return
    }

    if (pendingFocusIdRef.current !== null) {
      const pageId = pendingFocusIdRef.current
      pendingFocusIdRef.current = null
      deleteButtonRefs.current.get(pageId)?.focus()
    }
  }, [confirmingId])

  useEffect(() => {
    let active = true

    listByUser(user.id)
      .then((data) => {
        if (active) setPages(data)
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.id, reloadKey])

  function handleRetry() {
    setLoading(true)
    setLoadError('')
    setConfirmingId(null)
    setReloadKey((current) => current + 1)
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleCancelDelete(pageId) {
    pendingFocusIdRef.current = pageId
    setConfirmingId(null)
  }

  async function handleDelete(page) {
    if (String(page.userId) !== String(user.id)) {
      setActionError('Página não encontrada')
      return
    }

    setActionError('')
    setDeletingId(page.id)

    try {
      await remove(page.id)
      setPages((current) =>
        current.filter((candidate) => candidate.id !== page.id),
      )
      setConfirmingId(null)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setDeletingId(null)
    }
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

        <div className="pages-toolbar">
          <div className="pages-toolbar-actions">
            <Link className="primary-action" to="/paginas/nova">
              Nova nota
            </Link>
            <Link className="secondary-action" to="/checklists/nova">
              Nova checklist
            </Link>
          </div>
        </div>

        {loading && (
          <p className="page-status" role="status">
            Carregando páginas...
          </p>
        )}

        {!loading && loadError && (
          <div className="page-load-error">
            <p className="form-error" role="alert">
              {loadError}
            </p>
            <button
              className="secondary-action"
              type="button"
              onClick={handleRetry}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !loadError && pages.length === 0 && (
          <section className="empty-state" aria-labelledby="pages-empty-title">
            <h2 id="pages-empty-title">Nenhuma página ainda</h2>
            <p>
              Use “Nova nota” ou “Nova checklist” para criar sua primeira
              página.
            </p>
          </section>
        )}

        {!loading && !loadError && pages.length > 0 && (
          <ul className="page-list">
            {pages.map((page) => {
              const isNote = page.type === 'note'
              const editorPath = isNote
                ? `/paginas/${page.id}`
                : page.type === 'checklist'
                  ? `/checklists/${page.id}`
                  : null

              return (
                <li className="page-item" key={page.id}>
                  <div className="page-item-main">
                    {editorPath ? (
                      <Link className="page-item-title" to={editorPath}>
                        {page.title}
                      </Link>
                    ) : (
                      <span className="page-item-title">{page.title}</span>
                    )}
                    <span
                      className={`page-badge ${
                        isNote ? 'page-badge-note' : 'page-badge-checklist'
                      }`}
                    >
                      {isNote ? 'Nota' : 'Checklist'}
                    </span>
                  </div>

                  {(isNote || page.type === 'checklist') && (
                    <div className="page-item-actions">
                      {confirmingId === page.id ? (
                        <>
                          <button
                            ref={confirmButtonRef}
                            className="danger-action"
                            type="button"
                            onClick={() => handleDelete(page)}
                            disabled={deletingId === page.id}
                          >
                            {deletingId === page.id
                              ? 'Excluindo...'
                              : 'Confirmar'}
                          </button>
                          <button
                            className="secondary-action"
                            type="button"
                            onClick={() => handleCancelDelete(page.id)}
                            disabled={deletingId === page.id}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          ref={(element) => {
                            if (element) {
                              deleteButtonRefs.current.set(page.id, element)
                            } else {
                              deleteButtonRefs.current.delete(page.id)
                            }
                          }}
                          className="danger-action"
                          type="button"
                          onClick={() => {
                            setActionError('')
                            setConfirmingId(page.id)
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {actionError && (
          <p className="form-error page-actions-error" role="alert">
            {actionError}
          </p>
        )}
      </main>
    </div>
  )
}

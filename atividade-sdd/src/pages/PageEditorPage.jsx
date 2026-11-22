import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createNote, getById, updateNote } from '../api/pages'
import { useAuth } from '../auth/auth-context'

export default function PageEditorPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === undefined
  const titleRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loadedPage, setLoadedPage] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [savedId, setSavedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [trackedId, setTrackedId] = useState(id)

  const saved = !isNew && String(savedId) === String(id)

  if (trackedId !== id) {
    setTrackedId(id)
    setLoadedPage(null)
    setLoading(!isNew)
    setNotFound(false)
    setLoadError('')
    setFieldError('')
    setFormError('')
    setTitle('')
    setContent('')
    setSaving(false)
    if (trackedId !== undefined) setSavedId(null)
  }

  useEffect(() => {
    if (isNew) return

    let active = true

    getById(id)
      .then((page) => {
        if (!active) return

        if (
          page.type !== 'note' ||
          String(page.userId) !== String(user.id)
        ) {
          setNotFound(true)
          return
        }

        setLoadedPage(page)
        setTitle(page.title ?? '')
        setContent(page.content ?? '')
      })
      .catch((error) => {
        if (!active) return

        if (error.status === 404) {
          setNotFound(true)
          return
        }

        setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isNew, user.id, reloadKey])

  function handleRetry() {
    setLoading(true)
    setLoadedPage(null)
    setLoadError('')
    setNotFound(false)
    setReloadKey((current) => current + 1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSavedId(null)
    setFormError('')

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setFieldError('Informe um título')
      titleRef.current?.focus()
      return
    }

    setFieldError('')
    setSaving(true)

    try {
      if (isNew) {
        const created = await createNote({
          userId: user.id,
          title: trimmedTitle,
          content,
        })
        setLoading(true)
        setSavedId(String(created.id))
        navigate(`/paginas/${created.id}`, { replace: true })
      } else {
        if (
          !loadedPage ||
          String(loadedPage.id) !== String(id) ||
          loadedPage.type !== 'note' ||
          String(loadedPage.userId) !== String(user.id)
        ) {
          setNotFound(true)
          setLoadError('')
          return
        }

        await updateNote(id, { title: trimmedTitle, content })
        setSavedId(String(id))
      }
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pages-layout">
      <header className="app-header">
        <p className="brand">App de Anotações</p>
        <div className="app-header-user">
          <span className="user-name">{user.name}</span>
          <Link className="ghost-button" to="/">
            Suas páginas
          </Link>
        </div>
      </header>

      <main className="pages-main editor-main">
        {loading && (
          <p className="page-status" role="status">
            Carregando página...
          </p>
        )}

        {!loading && notFound && (
          <section className="not-found" aria-labelledby="page-not-found-title">
            <h1 id="page-not-found-title">Página não encontrada</h1>
            <p>Esta página não existe ou não pertence à sua conta.</p>
            <div className="not-found-actions">
              <Link className="primary-action" to="/">
                Voltar para suas páginas
              </Link>
            </div>
          </section>
        )}

        {!loading && !notFound && loadError && (
          <div className="page-load-error">
            <p className="form-error" role="alert">
              {loadError}
            </p>
            <div className="editor-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={handleRetry}
              >
                Tentar novamente
              </button>
              <Link className="secondary-action" to="/">
                Voltar para suas páginas
              </Link>
            </div>
          </div>
        )}

        {!loading && !notFound && !loadError && (
          <>
            <h1>{isNew ? 'Nova nota' : 'Editar nota'}</h1>
            <p className="pages-greeting">
              {isNew
                ? 'Dê um título e escreva o conteúdo da sua nota.'
                : 'Atualize o título ou o conteúdo e salve.'}
            </p>

            <form className="editor-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="page-title">Título</label>
                <input
                  ref={titleRef}
                  id="page-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setSavedId(null)
                  }}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={
                    fieldError ? 'page-title-error' : undefined
                  }
                />
                {fieldError && (
                  <p
                    className="field-error"
                    id="page-title-error"
                    role="alert"
                  >
                    {fieldError}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="page-content">Conteúdo</label>
                <textarea
                  id="page-content"
                  name="content"
                  rows={10}
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value)
                    setSavedId(null)
                  }}
                />
              </div>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="editor-actions">
                <button
                  className="primary-action"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <Link className="secondary-action" to="/">
                  Voltar
                </Link>
              </div>

              <p className="editor-status" role="status" aria-live="polite">
                {saved ? 'Nota salva' : ''}
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

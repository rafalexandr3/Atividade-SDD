import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createNote, updateNote } from '../api/pages'
import { useAuth } from '../auth/auth-context'
import { AppHeader } from '../components/AppHeader'
import {
  LoadErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageStates'
import { isPageOfType, isPageOwnedBy } from './page-ownership'
import { usePageLoader } from './usePageLoader'

export default function PageEditorPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === undefined
  const titleRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [savedId, setSavedId] = useState(null)
  const [saving, setSaving] = useState(false)

  const {
    loadedPage,
    loading,
    notFound,
    loadError,
    retry,
    markNotFound,
    startLoading,
  } = usePageLoader({
    id,
    type: 'note',
    userId: user.id,
    onIdChange: ({ previousId }) => {
      setFieldError('')
      setFormError('')
      setTitle('')
      setContent('')
      setSaving(false)
      if (previousId !== undefined) setSavedId(null)
    },
    onLoaded: (page) => {
      setTitle(page.title ?? '')
      setContent(page.content ?? '')
    },
  })

  const saved = !isNew && String(savedId) === String(id)

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
        startLoading()
        setSavedId(String(created.id))
        navigate(`/paginas/${created.id}`, { replace: true })
      } else {
        if (
          !loadedPage ||
          String(loadedPage.id) !== String(id) ||
          !isPageOfType(loadedPage, 'note') ||
          !isPageOwnedBy(loadedPage, user.id)
        ) {
          markNotFound()
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
      <AppHeader userName={user.name} />

      <main className="pages-main editor-main">
        {loading && <LoadingState message="Carregando página..." />}

        {!loading && notFound && <NotFoundState />}

        {!loading && !notFound && loadError && (
          <LoadErrorState message={loadError} onRetry={retry} withBackLink />
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

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createChecklist, getById, updateChecklist } from '../api/pages'
import { useAuth } from '../auth/auth-context'

function nextItemId(items) {
  return (
    items.reduce(
      (highest, item) => Math.max(highest, Number(item.id) || 0),
      0,
    ) + 1
  )
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return []

  return items.map((item) => ({
    id: item.id,
    text: item.text ?? '',
    done: Boolean(item.done),
  }))
}

export default function ChecklistEditorPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === undefined
  const titleRef = useRef(null)
  const itemInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [newItemText, setNewItemText] = useState('')
  const [loadedPage, setLoadedPage] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [titleError, setTitleError] = useState('')
  const [itemError, setItemError] = useState('')
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
    setTitleError('')
    setItemError('')
    setFormError('')
    setTitle('')
    setItems([])
    setNewItemText('')
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
          page.type !== 'checklist' ||
          String(page.userId) !== String(user.id)
        ) {
          setNotFound(true)
          return
        }

        setLoadedPage(page)
        setTitle(page.title ?? '')
        setItems(normalizeItems(page.items))
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

  function addItem() {
    const trimmedText = newItemText.trim()

    if (!trimmedText) {
      setItemError('Informe o texto do item')
      itemInputRef.current?.focus()
      return
    }

    setItemError('')
    setItems((current) => [
      ...current,
      { id: nextItemId(current), text: trimmedText, done: false },
    ])
    setNewItemText('')
    setSavedId(null)
  }

  function handleItemInputKeyDown(event) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    addItem()
  }

  function handleToggleItem(itemId) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    )
    setSavedId(null)
  }

  function handleRemoveItem(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId))
    setSavedId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSavedId(null)
    setItemError('')
    setFormError('')

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setTitleError('Informe um título')
      titleRef.current?.focus()
      return
    }

    setTitleError('')
    setSaving(true)

    try {
      if (isNew) {
        const created = await createChecklist({
          userId: user.id,
          title: trimmedTitle,
          items,
        })
        setLoading(true)
        setSavedId(String(created.id))
        navigate(`/checklists/${created.id}`, { replace: true })
      } else {
        if (
          !loadedPage ||
          String(loadedPage.id) !== String(id) ||
          loadedPage.type !== 'checklist' ||
          String(loadedPage.userId) !== String(user.id)
        ) {
          setNotFound(true)
          setLoadError('')
          return
        }

        await updateChecklist(id, { title: trimmedTitle, items })
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
            <h1>{isNew ? 'Nova checklist' : 'Editar checklist'}</h1>
            <p className="pages-greeting">
              {isNew
                ? 'Dê um título e adicione os itens da sua checklist.'
                : 'Atualize o título ou os itens e salve.'}
            </p>

            <form className="editor-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="checklist-title">Título</label>
                <input
                  ref={titleRef}
                  id="checklist-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setSavedId(null)
                  }}
                  disabled={saving}
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={
                    titleError ? 'checklist-title-error' : undefined
                  }
                />
                {titleError && (
                  <p
                    className="field-error"
                    id="checklist-title-error"
                    role="alert"
                  >
                    {titleError}
                  </p>
                )}
              </div>

              <section
                className="checklist-items"
                aria-labelledby="checklist-items-title"
              >
                <h2 id="checklist-items-title">Itens</h2>

                {items.length === 0 ? (
                  <p className="checklist-empty">
                    Nenhum item ainda. Adicione o primeiro item.
                  </p>
                ) : (
                  <ul className="checklist-list">
                    {items.map((item) => (
                      <li
                        className={`checklist-item${
                          item.done ? ' checklist-item-done' : ''
                        }`}
                        key={item.id}
                      >
                        <label className="checklist-item-label">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => handleToggleItem(item.id)}
                            disabled={saving}
                          />
                          <span className="checklist-item-text">
                            {item.text}
                          </span>
                        </label>
                        <button
                          className="danger-action checklist-remove"
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={saving}
                          aria-label={`Remover ${item.text}`}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="field checklist-add">
                  <label htmlFor="checklist-new-item">Novo item</label>
                  <div className="checklist-add-row">
                    <input
                      ref={itemInputRef}
                      id="checklist-new-item"
                      name="newItem"
                      type="text"
                      value={newItemText}
                      onChange={(event) => {
                        setNewItemText(event.target.value)
                        setSavedId(null)
                        if (itemError) setItemError('')
                      }}
                      onKeyDown={handleItemInputKeyDown}
                      disabled={saving}
                      aria-invalid={Boolean(itemError)}
                      aria-describedby={
                        itemError ? 'checklist-new-item-error' : undefined
                      }
                    />
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={addItem}
                      disabled={saving}
                    >
                      Adicionar
                    </button>
                  </div>
                  {itemError && (
                    <p
                      className="field-error"
                      id="checklist-new-item-error"
                      role="alert"
                    >
                      {itemError}
                    </p>
                  )}
                </div>
              </section>

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
                {saved ? 'Checklist salva' : ''}
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

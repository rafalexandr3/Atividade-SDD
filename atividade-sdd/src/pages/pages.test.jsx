import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { SESSION_KEY } from '../auth/session'
import PageEditorPage from './PageEditorPage'

const { mockGet, mockPost, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('../api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  },
}))

const sessionUser = {
  id: 1,
  name: 'Usuário Exemplo',
  email: 'usuario@exemplo.com',
}

const note = {
  id: 1,
  userId: 1,
  title: 'Minha nota',
  type: 'note',
  content: 'Conteúdo inicial',
}

const checklist = {
  id: 2,
  userId: 1,
  title: 'Minha checklist',
  type: 'checklist',
  items: [],
}

function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function EditorNavigationHarness() {
  const navigate = useNavigate()

  return (
    <>
      <button type="button" onClick={() => navigate('/paginas/2')}>
        Ir para nota 2
      </button>
      <Routes>
        <Route path="/paginas/:id" element={<PageEditorPage />} />
      </Routes>
    </>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
  mockGet.mockReset()
  mockPost.mockReset()
  mockPatch.mockReset()
  mockDelete.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('CRUD de páginas do tipo nota', () => {
  it('lista vazia mostra estado vazio e a ação "Nova nota"', async () => {
    mockGet.mockResolvedValue({ data: [] })
    renderApp(['/'])

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma página ainda' }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Nova nota' })).toBeTruthy()
    expect(mockGet).toHaveBeenCalledWith('/pages', {
      params: { userId: 1 },
    })
  })

  it('cria uma nota válida com POST e abre a nota salva', async () => {
    const created = {
      id: 3,
      userId: 1,
      title: 'Compras',
      type: 'note',
      content: 'Leite',
    }

    mockGet.mockImplementation((url) =>
      url === '/pages/3'
        ? Promise.resolve({ data: created })
        : Promise.resolve({ data: [] }),
    )
    mockPost.mockResolvedValue({ data: created })

    const user = userEvent.setup()
    renderApp(['/paginas/nova'])

    await user.type(await screen.findByLabelText('Título'), 'Compras')
    await user.type(screen.getByLabelText('Conteúdo'), 'Leite')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/pages', {
        userId: 1,
        title: 'Compras',
        type: 'note',
        content: 'Leite',
      })
    })

    expect(
      await screen.findByRole('heading', { name: 'Editar nota' }),
    ).toBeTruthy()
    expect(await screen.findByDisplayValue('Compras')).toBeTruthy()
    expect(screen.getByText('Nota salva')).toBeTruthy()
    expect(mockGet).toHaveBeenCalledWith('/pages/3')

    await user.type(screen.getByLabelText('Conteúdo'), '!')
    expect(screen.queryByText('Nota salva')).toBeNull()
  })

  it('título vazio não envia requisição, exibe erro e foca o título', async () => {
    const user = userEvent.setup()
    renderApp(['/paginas/nova'])

    await user.type(await screen.findByLabelText('Título'), '   ')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByText('Informe um título')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Título'))
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('edita com PATCH e o novo conteúdo aparece ao remontar a nota', async () => {
    const user = userEvent.setup()
    mockGet.mockResolvedValue({ data: note })
    mockPatch.mockResolvedValue({
      data: { ...note, content: 'Novo conteúdo' },
    })

    renderApp(['/paginas/1'])

    const content = await screen.findByLabelText('Conteúdo')
    await user.clear(content)
    await user.type(content, 'Novo conteúdo')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/pages/1', {
        title: 'Minha nota',
        content: 'Novo conteúdo',
      })
    })
    expect(await screen.findByText('Nota salva')).toBeTruthy()

    cleanup()
    mockGet.mockResolvedValue({
      data: { ...note, content: 'Novo conteúdo' },
    })
    renderApp(['/paginas/1'])

    expect(await screen.findByDisplayValue('Novo conteúdo')).toBeTruthy()
  })

  it('ao trocar de :id, esconde o formulário antigo, recarrega e salva a página certa', async () => {
    const secondNote = {
      id: 2,
      userId: 1,
      title: 'Segunda nota',
      type: 'note',
      content: 'Conteúdo da segunda nota',
    }
    let resolveSecondPage
    const secondPagePromise = new Promise((resolve) => {
      resolveSecondPage = resolve
    })

    mockGet.mockImplementation((url) => {
      if (url === '/pages/1') return Promise.resolve({ data: note })
      if (url === '/pages/2') return secondPagePromise
      return Promise.resolve({ data: [] })
    })
    mockPatch.mockResolvedValue({ data: secondNote })

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/paginas/1']}>
        <AuthProvider>
          <EditorNavigationHarness />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('Minha nota')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Ir para nota 2' }))

    expect(screen.getByText('Carregando página...')).toBeTruthy()
    expect(screen.queryByLabelText('Título')).toBeNull()

    await act(async () => {
      resolveSecondPage({ data: secondNote })
    })

    expect(await screen.findByDisplayValue('Segunda nota')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/pages/2', {
        title: 'Segunda nota',
        content: 'Conteúdo da segunda nota',
      })
    })
    expect(mockPatch).toHaveBeenCalledTimes(1)
  })

  it('exclui a nota em dois passos e remove a linha da lista', async () => {
    mockGet.mockResolvedValue({ data: [note, checklist] })
    mockDelete.mockResolvedValue({})

    const user = userEvent.setup()
    renderApp(['/'])

    expect(await screen.findByText('Minha nota')).toBeTruthy()
    expect(screen.getByText('Minha checklist')).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: 'Minha checklist' }),
    ).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Confirmar' }),
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Excluir' }),
    )

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Confirmar' }),
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/pages/1')
    })
    await waitFor(() => {
      expect(screen.queryByText('Minha nota')).toBeNull()
    })
    expect(screen.getByText('Minha checklist')).toBeTruthy()
  })

  it('abrir id inexistente mostra "Página não encontrada" com opção de voltar', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } })
    renderApp(['/paginas/999'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Voltar para suas páginas' }),
    ).toBeTruthy()
  })

  it('abrir página de outro usuário não expõe conteúdo nem ações', async () => {
    const otherUserNote = {
      id: 9,
      userId: 2,
      title: 'Nota privada',
      type: 'note',
      content: 'Segredo',
    }

    mockGet.mockResolvedValue({ data: otherUserNote })
    renderApp(['/paginas/9'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(screen.queryByText('Nota privada')).toBeNull()
    expect(screen.queryByText('Segredo')).toBeNull()
    expect(screen.queryByDisplayValue('Segredo')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull()
  })

  it('não abre uma checklist no editor de notas', async () => {
    mockGet.mockResolvedValue({ data: checklist })
    renderApp(['/paginas/2'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Conteúdo')).toBeNull()
  })

  it('API indisponível mostra erro e nova tentativa na lista e preserva o formulário no editor', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'))

    const listUser = userEvent.setup()
    renderApp(['/'])

    expect(
      await screen.findByText('Não foi possível conectar ao servidor'),
    ).toBeTruthy()

    mockGet.mockResolvedValue({ data: [] })
    await listUser.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Nenhuma página ainda' }),
    ).toBeTruthy()

    cleanup()

    mockGet.mockResolvedValue({ data: note })
    mockPatch.mockRejectedValue(new Error('Network Error'))

    const editorUser = userEvent.setup()
    renderApp(['/paginas/1'])

    const title = await screen.findByLabelText('Título')
    await editorUser.clear(title)
    await editorUser.type(title, 'Título mantido')
    await editorUser.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Não foi possível conectar ao servidor'),
    ).toBeTruthy()
    expect(screen.getByDisplayValue('Título mantido')).toBeTruthy()
  })
})

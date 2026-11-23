import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SESSION_KEY } from '../auth/session'
import {
  renderApp,
  resetClientMocks,
  seedChecklist as checklist,
  sessionUser,
} from '../test/render-app'

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

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
  resetClientMocks({ mockGet, mockPost, mockPatch, mockDelete })
})

afterEach(() => {
  cleanup()
})

describe('Checklists com itens editáveis', () => {
  it('lista checklist com link, selo "Checklist" e "Excluir"', async () => {
    mockGet.mockResolvedValue({ data: [checklist] })
    renderApp(['/'])

    const link = await screen.findByRole('link', { name: 'Minha checklist' })
    expect(link.getAttribute('href')).toBe('/checklists/2')
    expect(screen.getByText('Checklist')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeTruthy()
  })

  it('cria uma checklist válida com POST e abre a checklist salva', async () => {
    const created = {
      id: 3,
      userId: 1,
      title: 'Viagem',
      type: 'checklist',
      items: [
        { id: 1, text: 'Passaporte', done: false },
        { id: 2, text: 'Hotel', done: false },
      ],
    }

    mockGet.mockImplementation((url) =>
      url === '/pages/3'
        ? Promise.resolve({ data: created })
        : Promise.resolve({ data: [] }),
    )
    mockPost.mockResolvedValue({ data: created })

    const user = userEvent.setup()
    renderApp(['/checklists/nova'])

    await user.type(await screen.findByLabelText('Título'), 'Viagem')

    const newItem = screen.getByLabelText('Novo item')
    await user.type(newItem, 'Passaporte')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await user.type(newItem, 'Hotel')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/pages', {
        userId: 1,
        title: 'Viagem',
        type: 'checklist',
        items: [
          { id: 1, text: 'Passaporte', done: false },
          { id: 2, text: 'Hotel', done: false },
        ],
      })
    })

    expect(
      await screen.findByRole('heading', { name: 'Editar checklist' }),
    ).toBeTruthy()
    expect(
      await screen.findByRole('checkbox', { name: 'Passaporte' }),
    ).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Hotel' })).toBeTruthy()
    expect(screen.getByText('Checklist salva')).toBeTruthy()
    expect(mockGet).toHaveBeenCalledWith('/pages/3')
  })

  it('título vazio não envia requisição, exibe erro e foca o título', async () => {
    const user = userEvent.setup()
    renderApp(['/checklists/nova'])

    await user.type(await screen.findByLabelText('Título'), '   ')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByRole('alert').textContent).toBe('Informe um título')
    expect(document.activeElement).toBe(screen.getByLabelText('Título'))
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('item vazio não entra, exibe erro e foca o campo de item', async () => {
    const user = userEvent.setup()
    renderApp(['/checklists/nova'])

    const newItem = await screen.findByLabelText('Novo item')
    await user.type(newItem, '  ')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(screen.getByRole('alert').textContent).toBe(
      'Informe o texto do item',
    )
    expect(document.activeElement).toBe(newItem)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('adiciona item como não concluído', async () => {
    const user = userEvent.setup()
    renderApp(['/checklists/nova'])

    const newItem = await screen.findByLabelText('Novo item')
    await user.type(newItem, 'Leite')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(screen.getByRole('checkbox', { name: 'Leite' }).checked).toBe(false)
    expect(newItem.value).toBe('')
  })

  it('marca e desmarca o item, limpando "Checklist salva"', async () => {
    mockGet.mockResolvedValue({ data: checklist })
    mockPatch.mockResolvedValue({ data: checklist })

    const user = userEvent.setup()
    renderApp(['/checklists/2'])

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Item de exemplo',
    })
    expect(checkbox.checked).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Checklist salva')).toBeTruthy()

    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
    expect(screen.queryByText('Checklist salva')).toBeNull()

    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)
    expect(screen.queryByText('Checklist salva')).toBeNull()
  })

  it('remove item e ele não reaparece após salvar', async () => {
    mockGet.mockResolvedValue({ data: checklist })
    mockPatch.mockResolvedValue({ data: checklist })

    const user = userEvent.setup()
    renderApp(['/checklists/2'])

    await screen.findByRole('checkbox', { name: 'Item de exemplo' })

    const firstItem = screen.getByText('Item de exemplo').closest('li')
    await user.click(
      within(firstItem).getByRole('button', {
        name: 'Remover Item de exemplo',
      }),
    )

    expect(screen.queryByText('Item de exemplo')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/pages/2', {
        title: 'Minha checklist',
        items: [{ id: 2, text: 'Segundo item', done: true }],
      })
    })

    cleanup()
    mockGet.mockResolvedValue({
      data: {
        ...checklist,
        items: [{ id: 2, text: 'Segundo item', done: true }],
      },
    })
    renderApp(['/checklists/2'])

    expect(
      await screen.findByRole('checkbox', { name: 'Segundo item' }),
    ).toBeTruthy()
    expect(screen.queryByText('Item de exemplo')).toBeNull()
  })

  it('edita e salva com PATCH, mantendo os dados ao recarregar', async () => {
    const updated = {
      ...checklist,
      title: 'Viagem',
      items: [
        { id: 1, text: 'Item de exemplo', done: true },
        { id: 2, text: 'Segundo item', done: true },
      ],
    }

    mockGet.mockResolvedValue({ data: checklist })
    mockPatch.mockResolvedValue({ data: updated })

    const user = userEvent.setup()
    renderApp(['/checklists/2'])

    const title = await screen.findByLabelText('Título')
    await user.clear(title)
    await user.type(title, 'Viagem')
    await user.click(
      screen.getByRole('checkbox', { name: 'Item de exemplo' }),
    )
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/pages/2', {
        title: 'Viagem',
        items: [
          { id: 1, text: 'Item de exemplo', done: true },
          { id: 2, text: 'Segundo item', done: true },
        ],
      })
    })
    expect(await screen.findByText('Checklist salva')).toBeTruthy()

    cleanup()
    mockGet.mockResolvedValue({ data: updated })
    renderApp(['/checklists/2'])

    expect(await screen.findByDisplayValue('Viagem')).toBeTruthy()
    expect(
      screen.getByRole('checkbox', { name: 'Item de exemplo' }).checked,
    ).toBe(true)
  })

  it('id inexistente mostra "Página não encontrada" com opção de voltar', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } })
    renderApp(['/checklists/999'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Voltar para suas páginas' }),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull()
  })

  it('não abre checklist de outra conta nem uma nota', async () => {
    mockGet.mockResolvedValue({
      data: {
        id: 9,
        userId: 2,
        title: 'Checklist privada',
        type: 'checklist',
        items: [{ id: 1, text: 'Segredo', done: false }],
      },
    })
    renderApp(['/checklists/9'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(screen.queryByText('Checklist privada')).toBeNull()
    expect(screen.queryByText('Segredo')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull()

    cleanup()

    mockGet.mockResolvedValue({
      data: {
        id: 1,
        userId: 1,
        title: 'Minha nota',
        type: 'note',
        content: 'Texto da nota',
      },
    })
    renderApp(['/checklists/1'])

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeTruthy()
    expect(screen.queryByText('Minha nota')).toBeNull()
    expect(screen.queryByText('Texto da nota')).toBeNull()
    expect(screen.queryByLabelText('Título')).toBeNull()
  })

  it('API indisponível mostra erro e nova tentativa na lista e preserva o formulário no editor', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'))

    const listUser = userEvent.setup()
    renderApp(['/'])

    expect(
      await screen.findByText('Não foi possível conectar ao servidor'),
    ).toBeTruthy()

    mockGet.mockResolvedValue({ data: [checklist] })
    await listUser.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    )
    expect(
      await screen.findByRole('link', { name: 'Minha checklist' }),
    ).toBeTruthy()

    cleanup()

    mockGet.mockResolvedValue({ data: checklist })
    mockPatch.mockRejectedValue(new Error('Network Error'))

    const editorUser = userEvent.setup()
    renderApp(['/checklists/2'])

    const title = await screen.findByLabelText('Título')
    await editorUser.clear(title)
    await editorUser.type(title, 'Título mantido')
    await editorUser.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Não foi possível conectar ao servidor'),
    ).toBeTruthy()
    expect(screen.getByDisplayValue('Título mantido')).toBeTruthy()
    expect(
      screen.getByRole('checkbox', { name: 'Item de exemplo' }),
    ).toBeTruthy()
  })
})

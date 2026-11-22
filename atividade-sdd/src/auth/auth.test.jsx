import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from './AuthContext'
import { SESSION_KEY } from './session'

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}))

vi.mock('../api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}))

const seedUser = {
  id: 1,
  name: 'Usuário Exemplo',
  email: 'usuario@exemplo.com',
  password: '123456',
}

const sessionUser = {
  id: seedUser.id,
  name: seedUser.name,
  email: seedUser.email,
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

function readSession() {
  const raw = window.localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

beforeEach(() => {
  window.localStorage.clear()
  mockGet.mockReset()
  mockPost.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('autenticação', () => {
  it('login válido salva a sessão sem senha e redireciona para a área de páginas', async () => {
    mockGet.mockResolvedValue({ data: [seedUser] })
    const user = userEvent.setup()
    renderApp(['/login'])

    await user.type(screen.getByLabelText('E-mail'), 'usuario@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('heading', { name: 'Suas páginas' }),
    ).toBeTruthy()
    expect(screen.getByText('Olá, Usuário Exemplo.')).toBeTruthy()
    expect(readSession()).toEqual(sessionUser)
    expect(window.localStorage.getItem(SESSION_KEY)).not.toContain('123456')
    expect(mockGet).toHaveBeenCalledWith('/users', {
      params: { email: 'usuario@exemplo.com' },
    })
  })

  it('login inválido permanece em /login sem criar sessão', async () => {
    mockGet.mockResolvedValue({ data: [seedUser] })
    const user = userEvent.setup()
    renderApp(['/login'])

    await user.type(screen.getByLabelText('E-mail'), 'usuario@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText('E-mail ou senha inválidos'),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeTruthy()
    expect(readSession()).toBeNull()
  })

  it('cadastro novo cria o usuário, autentica e redireciona para /', async () => {
    mockGet.mockResolvedValue({ data: [] })
    mockPost.mockResolvedValue({
      data: {
        id: 2,
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        password: 'senha123',
      },
    })
    const user = userEvent.setup()
    renderApp(['/cadastro'])

    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'Ana@Exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByRole('heading', { name: 'Suas páginas' }),
    ).toBeTruthy()
    expect(screen.getByText('Olá, Ana Souza.')).toBeTruthy()
    expect(mockPost).toHaveBeenCalledWith('/users', {
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: 'senha123',
    })
    expect(readSession()).toEqual({
      id: 2,
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
    })
  })

  it('e-mail duplicado não cria usuário nem sessão', async () => {
    mockGet.mockResolvedValue({ data: [seedUser] })
    const user = userEvent.setup()
    renderApp(['/cadastro'])

    await user.type(screen.getByLabelText('Nome'), 'Outra Pessoa')
    await user.type(screen.getByLabelText('E-mail'), 'Usuario@Exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('E-mail já cadastrado')).toBeTruthy()
    expect(mockPost).not.toHaveBeenCalled()
    expect(readSession()).toBeNull()
  })

  it('validação local bloqueia requisições e foca o primeiro campo inválido', async () => {
    const user = userEvent.setup()
    renderApp(['/cadastro'])

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByText('Informe seu nome')).toBeTruthy()
    expect(screen.getByText('Informe seu e-mail')).toBeTruthy()
    expect(screen.getByText('Informe uma senha')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Nome'))

    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('E-mail'), 'email-invalido')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByText('Informe um e-mail válido')).toBeTruthy()
    expect(
      screen.getByText('A senha deve ter pelo menos 6 caracteres'),
    ).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('E-mail'))
    expect(mockGet).not.toHaveBeenCalled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('login com senha curta exibe erro por campo sem enviar requisição', async () => {
    const user = userEvent.setup()
    renderApp(['/login'])

    await user.type(screen.getByLabelText('E-mail'), 'usuario@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      screen.getByText('A senha deve ter pelo menos 6 caracteres'),
    ).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Senha'))
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('API indisponível exibe erro de conexão sem criar sessão', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'))
    const user = userEvent.setup()
    renderApp(['/login'])

    await user.type(screen.getByLabelText('E-mail'), 'usuario@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText('Não foi possível conectar ao servidor'),
    ).toBeTruthy()
    expect(readSession()).toBeNull()
  })

  it('sessão persistida mantém o usuário autenticado após recarregar', async () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    renderApp(['/'])

    expect(
      await screen.findByRole('heading', { name: 'Suas páginas' }),
    ).toBeTruthy()
    expect(screen.getByText('Olá, Usuário Exemplo.')).toBeTruthy()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('sessão com JSON corrompido é descartada e redireciona para /login', async () => {
    window.localStorage.setItem(SESSION_KEY, '{json-invalido')
    renderApp(['/'])

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeTruthy()
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('logout remove a sessão e bloqueia a área de páginas', async () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    const user = userEvent.setup()
    renderApp(['/'])

    await user.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeTruthy()
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('visitante em / é redirecionado para /login sem ver a área de páginas', async () => {
    renderApp(['/'])

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Suas páginas' })).toBeNull()
  })

  it('autenticado em rota pública é redirecionado para /', async () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    renderApp(['/login'])

    expect(
      await screen.findByRole('heading', { name: 'Suas páginas' }),
    ).toBeTruthy()
  })
})

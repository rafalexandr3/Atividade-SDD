import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'

export const sessionUser = {
  id: 1,
  name: 'Usuário Exemplo',
  email: 'usuario@exemplo.com',
}

export const seedNote = {
  id: 1,
  userId: 1,
  title: 'Minha nota',
  type: 'note',
  content: 'Conteúdo inicial',
}

export const seedChecklist = {
  id: 2,
  userId: 1,
  title: 'Minha checklist',
  type: 'checklist',
  items: [
    { id: 1, text: 'Item de exemplo', done: false },
    { id: 2, text: 'Segundo item', done: true },
  ],
}

export function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

export function resetClientMocks(mocks) {
  Object.values(mocks).forEach((mock) => mock.mockReset())
}

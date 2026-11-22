export const SESSION_KEY = 'app-anotacoes.session'

function isValidSession(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.id !== undefined &&
    value.id !== null &&
    typeof value.name === 'string' &&
    typeof value.email === 'string'
  )
}

export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!isValidSession(parsed)) {
      clearSession()
      return null
    }

    return { id: parsed.id, name: parsed.name, email: parsed.email }
  } catch {
    clearSession()
    return null
  }
}

export function saveSession(user) {
  const session = { id: user.id, name: user.name, email: user.email }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

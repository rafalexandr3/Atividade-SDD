export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6

export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function validateEmail(email) {
  if (!email.trim()) return 'Informe seu e-mail'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Informe um e-mail válido'
  return ''
}

function validatePassword(password, emptyMessage) {
  if (!password) return emptyMessage
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`
  }
  return ''
}

function validateCredentials(email, password, passwordEmptyMessage) {
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password, passwordEmptyMessage)
  if (passwordError) errors.password = passwordError

  return errors
}

export function validateLogin(email, password) {
  return validateCredentials(email, password, 'Informe sua senha')
}

export function validateRegister(name, email, password) {
  const errors = validateCredentials(email, password, 'Informe uma senha')

  if (!name.trim()) errors.name = 'Informe seu nome'

  return errors
}

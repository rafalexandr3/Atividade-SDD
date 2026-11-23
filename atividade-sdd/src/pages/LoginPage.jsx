import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { validateLogin } from '../auth/validation'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const nextErrors = validateLogin(email, password)
    setErrors(nextErrors)

    if (nextErrors.email) {
      emailRef.current?.focus()
      return
    }
    if (nextErrors.password) {
      passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-header">
          <p className="brand">App de Anotações</p>
          <h1 id="login-title">Entrar</h1>
          <p className="auth-subtitle">
            Acesse suas notas e checklists em um só lugar.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <p className="field-error" id="login-email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="login-password">Senha</label>
            <input
              ref={passwordRef}
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
            />
            {errors.password && (
              <p
                className="field-error"
                id="login-password-error"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </section>
    </main>
  )
}

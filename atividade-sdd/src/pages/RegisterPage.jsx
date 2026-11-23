import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { validateRegister } from '../auth/validation'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const nextErrors = validateRegister(name, email, password)
    setErrors(nextErrors)

    if (nextErrors.name) {
      nameRef.current?.focus()
      return
    }
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
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="register-title">
        <header className="auth-header">
          <p className="brand">App de Anotações</p>
          <h1 id="register-title">Criar conta</h1>
          <p className="auth-subtitle">
            Cadastre-se para começar a organizar suas páginas.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="register-name">Nome</label>
            <input
              ref={nameRef}
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? 'register-name-error' : undefined
              }
            />
            {errors.name && (
              <p className="field-error" id="register-name-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              ref={emailRef}
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'register-email-error' : undefined
              }
            />
            {errors.email && (
              <p className="field-error" id="register-email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="register-password">Senha</label>
            <input
              ref={passwordRef}
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'register-password-error' : undefined
              }
            />
            {errors.password && (
              <p
                className="field-error"
                id="register-password-error"
                role="alert"
              >
                {errors.password}
              </p>
            )}
            <p className="field-hint">Use pelo menos 6 caracteres.</p>
          </div>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  )
}

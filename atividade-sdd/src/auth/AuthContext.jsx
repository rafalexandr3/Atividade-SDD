import { useMemo, useState } from 'react'
import client from '../api/client'
import { ApiError, toApiError } from '../api/errors'
import { AuthContext } from './auth-context'
import { clearSession, getSession, saveSession } from './session'
import { normalizeEmail } from './validation'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession())

  const value = useMemo(() => {
    function persistUser(account) {
      const session = saveSession(account)
      setUser(session)
      return session
    }

    async function login(email, password) {
      const normalizedEmail = normalizeEmail(email)

      try {
        const { data } = await client.get('/users', {
          params: { email: normalizedEmail },
        })
        const account = Array.isArray(data)
          ? data.find(
              (candidate) =>
                normalizeEmail(candidate.email) === normalizedEmail &&
                candidate.password === password,
            )
          : undefined

        if (!account) {
          throw new ApiError('E-mail ou senha inválidos')
        }

        return persistUser(account)
      } catch (error) {
        throw toApiError(error)
      }
    }

    async function register(name, email, password) {
      const normalizedEmail = normalizeEmail(email)
      const normalizedName = String(name ?? '').trim()

      try {
        const { data } = await client.get('/users', {
          params: { email: normalizedEmail },
        })
        const alreadyExists =
          Array.isArray(data) &&
          data.some(
            (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
          )

        if (alreadyExists) {
          throw new ApiError('E-mail já cadastrado')
        }

        const { data: created } = await client.post('/users', {
          name: normalizedName,
          email: normalizedEmail,
          password,
        })

        return persistUser(created)
      } catch (error) {
        throw toApiError(error)
      }
    }

    function logout() {
      clearSession()
      setUser(null)
    }

    return { user, login, register, logout }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

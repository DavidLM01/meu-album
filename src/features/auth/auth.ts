import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const AUTH_COOKIE = 'admin_session'
const ADMIN_PASSWORD = process.env.SENHAADM || process.env.ADMIN_PASSWORD || 'senha123'

export const loginAdmin = createServerFn({ method: 'POST' })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (data.password === ADMIN_PASSWORD) {
      setCookie(AUTH_COOKIE, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return { success: true }
    }
    return { success: false, error: 'Senha incorreta' }
  })

export const logoutAdmin = createServerFn({ method: 'POST' }).handler(
  async () => {
    setCookie(AUTH_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return { success: true }
  },
)

export const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const session = getCookie(AUTH_COOKIE)
  return { isAuthenticated: session === 'true' }
})

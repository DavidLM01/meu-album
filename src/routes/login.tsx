import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { loginAdmin } from '../features/auth/auth.ts'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useServerFn(loginAdmin)
  const navigate = useNavigate()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login({ data: { password } })
    if (result.success) {
      router.invalidate().then(() => {
        navigate({ to: '/admin' })
      })
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000D1A] px-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/40"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-neutral-200"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

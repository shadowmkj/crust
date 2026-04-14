import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { getAdminSessionFn } from '#/server/actions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    const session = await getAdminSessionFn()
    if (session) {
      throw redirect({ to: '/admin' })
    }
  },
  component: AdminLogin,
})

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { data, error } = await authClient.signIn.email({
        email,
        password,
    })

    if (error) {
        setError(error.message ?? 'Invalid credentials')
        setLoading(false)
        return
    }

    if (data) {
        navigate({ to: '/admin' })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-100">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@wecode.com" 
              required
              className="bg-slate-950 border-slate-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
               className="bg-slate-950 border-slate-800"
            />
          </div>
          {error && <p className="text-red-400 font-medium text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}

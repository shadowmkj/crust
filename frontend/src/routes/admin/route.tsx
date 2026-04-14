import { createFileRoute, redirect, Outlet, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { getAdminSessionFn } from '#/server/actions'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const session = await getAdminSessionFn()
    if (!session && location.pathname !== '/admin/login') {
      throw redirect({ to: '/admin/login' })
    }
    return { user: session?.user ?? null }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center w-full">
      <nav className="w-full p-4 border-b border-slate-800 flex justify-between items-center px-8">
        <h1 className="text-2xl font-black bg-gradient-to-br from-indigo-400 to-purple-500 text-transparent bg-clip-text">WeCode</h1>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-300 font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>
      <main className="flex-1 w-full max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

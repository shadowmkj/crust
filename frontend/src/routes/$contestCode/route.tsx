import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { verifyParticipantFn, type ParticipantSession } from '#/server/actions'

export const Route = createFileRoute('/$contestCode')({
  beforeLoad: async ({ params }): Promise<{ participant: ParticipantSession }> => {
     const participant = await verifyParticipantFn({ data: { contestCode: params.contestCode } })
     if (!participant) {
         throw redirect({ to: '/' })
     }
     return { participant }
  },
  component: ContestLayout,
})

function ContestLayout() {
  const { participant } = Route.useRouteContext()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center w-full">
      <nav className="w-full p-4 border-b border-slate-800 flex justify-between items-center px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">WeCode</h1>
        <div className="flex gap-4 items-center">
            <span className="text-slate-400 text-sm">Playing as</span>
            <span className="font-semibold px-3 py-1 bg-slate-800 rounded-full text-indigo-300">{participant.name}</span>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'

const getContestProblemsFn = createServerFn({ method: "GET" })
    .inputValidator((d: { contestId: string }) => d)
    .handler(async ({ data }) => {
        return await prisma.problem.findMany({
            where: { contestId: data.contestId },
            orderBy: { createdAt: 'asc' }
        })
    })

export const Route = createFileRoute('/$contestCode/')({
  component: ContestDashboard,
  loader: async ({ context }) => {
      const participant = context.participant as { contestId: string; contestCode: string }
      const problems = await getContestProblemsFn({ data: { contestId: participant.contestId } })
      return { problems, participant }
  }
})

function ContestDashboard() {
  const { problems, participant } = Route.useLoaderData()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12 shadow-sm relative overflow-hidden">
             {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <h2 className="text-3xl md:text-5xl font-black text-slate-100 mb-4 relative z-10">Welcome to the Arena</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto relative z-10">
               Select a problem below to begin coding. Your progress is being tracked against others in real-time. Good luck!
            </p>
        </div>

        <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 text-transparent bg-clip-text">Available Problems</h3>
            {problems.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center text-slate-400">
                    The admin has not added any problems yet. Refresh the page soon!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {problems.map((problem, idx) => (
                         <div key={problem.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-indigo-500/50 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] transition duration-300 group">
                             <div className="flex items-center gap-3 mb-3">
                                 <div className="bg-slate-950 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm border border-slate-800 group-hover:border-indigo-500/50 transition">
                                     {idx + 1}
                                 </div>
                                 <h4 className="text-xl font-bold text-slate-200 group-hover:text-indigo-400 transition">{problem.title}</h4>
                             </div>
                             <p className="text-slate-400 line-clamp-2 text-sm mb-6">{problem.description}</p>
                             <Link to="/$contestCode/problem/$problemId" params={{ contestCode: participant.contestCode, problemId: problem.id }} className="block w-full">
                                  <Button className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition">
                                      Solve Challenge
                                  </Button>
                             </Link>
                         </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

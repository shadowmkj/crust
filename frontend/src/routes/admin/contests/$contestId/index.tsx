import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'

const getContest = createServerFn({ method: "GET" })
    .inputValidator((d: { contestId: string }) => d)
    .handler(async ({ data }) => {
        const contest = await prisma.contest.findUnique({
             where: { id: data.contestId },
             include: { problems: true, participants: true }
        })
        if (!contest) throw new Error("Not found")
        return contest
    })

const deleteContestFn = createServerFn({ method: 'POST' })
    .inputValidator((d: { contestId: string }) => d)
    .handler(async ({ data }) => {
        await prisma.contest.delete({ where: { id: data.contestId } })
        return { ok: true }
    })

const deleteProblemFn = createServerFn({ method: 'POST' })
    .inputValidator((d: { contestId: string; problemId: string }) => d)
    .handler(async ({ data }) => {
        const result = await prisma.problem.deleteMany({
            where: {
                id: data.problemId,
                contestId: data.contestId,
            },
        })

        if (result.count === 0) {
            throw new Error('Problem not found')
        }

        return { ok: true }
    })

export const Route = createFileRoute('/admin/contests/$contestId/')({
  component: ContestDetail,
  loader: async ({ params }) => await getContest({ data: { contestId: params.contestId } }),
})

function ContestDetail() {
  const contest = Route.useLoaderData()
  const navigate = useNavigate()
    const router = useRouter()

    const handleDeleteContest = async () => {
        if (typeof window !== 'undefined') {
            const confirmed = window.confirm('Delete this contest? This removes all problems and participants.')
            if (!confirmed) return
        }

        await deleteContestFn({ data: { contestId: contest.id } })
        navigate({ to: '/admin' })
    }

    const handleDeleteProblem = async (problemId: string) => {
        if (typeof window !== 'undefined') {
            const confirmed = window.confirm('Delete this problem permanently?')
            if (!confirmed) return
        }

        await deleteProblemFn({ data: { contestId: contest.id, problemId } })
        await router.invalidate()
    }

  return (
    <div className="space-y-8">
       <div>
            <Button variant="link" className="text-slate-400 pl-0 hover:text-indigo-400 mb-4" onClick={() => navigate({ to: '/admin' })}>
                &larr; Back to Contests
            </Button>
            <div className="flex justify-between items-start">
               <div>
                   <h2 className="text-4xl font-bold text-slate-100 mb-2">{contest.title}</h2>
                   <p className="text-xl text-slate-400 font-mono tracking-wider">Code: <span className="bg-slate-800 text-indigo-300 px-2 rounded-md">{contest.code}</span></p>
               </div>
                             <div className="flex gap-3">
                                 <Link to="/admin/contests/$contestId/edit" params={{ contestId: contest.id }}>
                                     <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
                                         Edit Contest
                                     </Button>
                                 </Link>
                                 <Button
                                     type="button"
                                     variant="outline"
                                     onClick={handleDeleteContest}
                                     className="border-red-700 text-red-300 hover:bg-red-950/60 hover:text-red-200"
                                 >
                                     Delete Contest
                                 </Button>
                                 <Link to="/admin/contests/$contestId/problems/create" params={{ contestId: contest.id }}>
                                         <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-900/20">
                                                 + Add Problem
                                         </Button>
                                 </Link>
                             </div>
            </div>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
           <h3 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Problems</h3>
           {contest.problems.length === 0 ? (
               <div className="py-8 text-center text-slate-400 text-lg">
                   No problems found for this contest.
               </div>
           ) : (
                <div className="space-y-4">
                    {contest.problems.map((problem) => (
                        <div key={problem.id} className="bg-slate-950 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
                            <h4 className="text-xl font-bold text-slate-200 mb-2">{problem.title}</h4>
                            <p className="text-slate-400 line-clamp-2 text-sm">{problem.description}</p>
                                                        <div className="mt-4 flex gap-2">
                                                                <Link to="/admin/contests/$contestId/problems/$problemId/edit" params={{ contestId: contest.id, problemId: problem.id }}>
                                                                    <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white mr-2">
                                                                            Edit
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => handleDeleteProblem(problem.id)}
                                                                    className="border-red-700 text-red-300 hover:bg-red-950/60 hover:text-red-200"
                                                                >
                                                                    Delete
                                                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
           )}
       </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
           <h3 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Participants</h3>
            {contest.participants.length === 0 ? (
               <div className="py-8 text-center text-slate-400 text-lg">
                   No participants yet.
               </div>
           ) : (
                <div className="space-y-2">
                     {contest.participants.map(p => (
                         <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex justify-between">
                            <span className="font-semibold text-slate-200">{p.name}</span>
                            <span className="text-slate-500 text-sm">{new Date(p.joinedAt).toLocaleString()}</span>
                         </div>
                     ))}
                </div>
           )}
        </div>
    </div>
  )
}

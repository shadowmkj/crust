import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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

export const Route = createFileRoute('/admin/contests/$contestId/')({
  component: ContestDetail,
  loader: async ({ params }) => await getContest({ data: { contestId: params.contestId } }),
})

function ContestDetail() {
  const contest = Route.useLoaderData()
  const navigate = useNavigate()

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
               <Link to="/admin/contests/$contestId/problems/create" params={{ contestId: contest.id }}>
                   <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-900/20">
                       + Add Problem
                   </Button>
               </Link>
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
                            <div className="mt-4">
                                <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white mr-2">
                                    Edit
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

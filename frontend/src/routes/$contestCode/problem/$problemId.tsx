import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'

const getProblemFn = createServerFn({ method: "GET" })
    .inputValidator((d: { problemId: string; contestId: string }) => d)
    .handler(async ({ data }) => {
         const problem = await prisma.problem.findFirst({
             where: { id: data.problemId, contestId: data.contestId }
         })
         if (!problem) throw new Error("Problem not found")
         return problem
    })

export const Route = createFileRoute('/$contestCode/problem/$problemId')({
  component: ProblemDetail,
  loader: async ({ params, context }) => {
      const participant = context.participant as { contestId: string }
      const problem = await getProblemFn({ data: { problemId: params.problemId, contestId: participant.contestId } })
      return { problem }
  }
})

function ProblemDetail() {
  const { problem } = Route.useLoaderData()
  const { contestCode } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
         <Button variant="link" className="text-slate-400 pl-0 hover:text-indigo-400" onClick={() => navigate({ to: '/$contestCode', params: { contestCode } })}>
           &larr; Back to Problems
         </Button>

         <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
             <div className="p-8 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-3xl font-black text-slate-100">{problem.title}</h2>
             </div>
             
             <div className="p-8 prose prose-invert max-w-none text-slate-300">
                 {/* In a real app we'd use a Markdown renderer here */}
                 <div className="whitespace-pre-wrap">{problem.description}</div>
             </div>
             
             <div className="p-8 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
                 <div className="text-sm text-slate-500">
                     Time Limit: 2.0s | Memory Limit: 256MB
                 </div>
                 <Button disabled className="bg-indigo-600/50 text-slate-300 font-semibold italic">
                     Code Editor Coming Soon
                 </Button>
             </div>
         </div>
    </div>
  )
}

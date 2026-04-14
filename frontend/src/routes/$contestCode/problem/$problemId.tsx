import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'
import CodeEditor from '#/components/CodeEditor'

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
  const { contestCode, problemId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-5rem)] w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-none flex-col gap-6">
        <Button
          variant="link"
          className="w-fit pl-0 text-slate-400 hover:text-indigo-400"
          onClick={() => navigate({ to: '/$contestCode', params: { contestCode } })}
        >
          &larr; Back to Problems
        </Button>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] xl:items-stretch">
          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 bg-slate-950/50 p-8">
              <h2 className="text-3xl font-black text-slate-100">{problem.title}</h2>
            </div>

            <div className="flex-1 p-8 prose prose-invert max-w-none text-slate-300">
              {/* In a real app we'd use a Markdown renderer here */}
              <div className="whitespace-pre-wrap">{problem.description}</div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 p-8">
              <div className="text-sm text-slate-500">
                Time Limit: 2.0s | Memory Limit: 256MB
              </div>
            </div>
          </div>

          <div className="flex min-h-[420px] xl:min-h-0">
            <CodeEditor
              storageKey={`wecode:editor:${contestCode}:${problemId}`}
              initialLanguage={problem.starterLanguage as 'c' | 'cpp' | 'java' | 'python'}
              initialCode={problem.starterCode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

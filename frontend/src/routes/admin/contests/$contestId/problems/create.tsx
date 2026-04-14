import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { useState } from 'react'

const createProblemFn = createServerFn({ method: "POST" })
    .inputValidator((d: { contestId: string; title: string; description: string }) => d)
    .handler(async ({ data }) => {
        const problem = await prisma.problem.create({
            data: {
                title: data.title,
                description: data.description,
                contestId: data.contestId,
            }
        })
        return problem
    })

export const Route = createFileRoute('/admin/contests/$contestId/problems/create')({
  component: CreateProblem,
})

function CreateProblem() {
  const { contestId } = Route.useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
        await createProblemFn({ data: { title, description, contestId } })
        navigate({ to: '/admin/contests/$contestId', params: { contestId } })
    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <Button variant="link" className="text-slate-400 pl-0 hover:text-indigo-400 mb-2" onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId } })}>
           &larr; Back to Contest
       </Button>
       
       <h2 className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-purple-500 text-transparent bg-clip-text">Add Problem</h2>
       <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
           <div className="space-y-2">
               <Label htmlFor="title" className="text-slate-300">Problem Title</Label>
               <Input 
                   id="title" 
                   value={title} 
                   onChange={e => setTitle(e.target.value)} 
                   placeholder="e.g. Reverse a String"
                   required
                   className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500"
               />
           </div>
           <div className="space-y-2">
               <Label htmlFor="description" className="text-slate-300">Problem Description</Label>
               <Textarea 
                   id="description" 
                   value={description} 
                   onChange={e => setDescription(e.target.value)} 
                   placeholder="Write the detailed problem statement here..."
                   required
                   className="bg-slate-950 border-slate-800 min-h-[200px] focus-visible:ring-indigo-500"
               />
           </div>
           {error && <p className="text-red-400 font-medium text-sm">{error}</p>}
           <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                   {loading ? "Saving..." : "Save Problem"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId } })} className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white">
                   Cancel
                </Button>
            </div>
       </form>
    </div>
  )
}

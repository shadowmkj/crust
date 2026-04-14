import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useState } from 'react'

const createContestFn = createServerFn({ method: "POST" })
    .inputValidator((d: { title: string; code: string }) => d)
    .handler(async ({ data }) => {
        // Find existing created admin or first admin. 
        const adminUser = await prisma.user.findFirst()
        if (!adminUser) throw new Error("No admin user found")

        // check if code exists
        const exists = await prisma.contest.findUnique({ where: { code: data.code } })
        if (exists) {
            throw new Error("Contest code already taken")
        }

        const contest = await prisma.contest.create({
            data: {
                title: data.title,
                code: data.code,
                createdById: adminUser.id,
            }
        })
        return contest
    })

export const Route = createFileRoute('/admin/contests/create')({
  component: CreateContest,
})

function CreateContest() {
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
        const res = await createContestFn({ data: { title, code } })
        navigate({ to: "/admin/contests/$contestId", params: { contestId: res.id } })
    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold">Create Contest</h2>
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
             <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Contest Title</Label>
                <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. CodeJam 2026"
                    required
                    className="bg-slate-950 border-slate-800"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-300">Contest Code</Label>
                <Input 
                    id="code" 
                    value={code} 
                    onChange={e => setCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. CJ2026"
                    required
                    className="bg-slate-950 border-slate-800 uppercase font-mono"
                />
                <p className="text-sm text-slate-500">Participants will use this code to join.</p>
             </div>
             {error && <p className="text-red-400 font-medium text-sm">{error}</p>}
             <div className="flex gap-4">
                 <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    {loading ? "Creating..." : "Create Contest"}
                 </Button>
                 <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin' })} className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Cancel
                 </Button>
             </div>
        </form>
    </div>
  )
}

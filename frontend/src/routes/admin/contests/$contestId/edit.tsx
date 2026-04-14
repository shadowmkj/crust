import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useState } from 'react'

const getContestFn = createServerFn({ method: 'GET' })
  .inputValidator((d: { contestId: string }) => d)
  .handler(async ({ data }) => {
    const contest = await prisma.contest.findUnique({ where: { id: data.contestId } })
    if (!contest) throw new Error('Contest not found')
    return contest
  })

const updateContestFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { contestId: string; title: string; code: string }) => d)
  .handler(async ({ data }) => {
    const normalizedCode = data.code.trim().toUpperCase()

    const codeOwner = await prisma.contest.findUnique({ where: { code: normalizedCode } })
    if (codeOwner && codeOwner.id !== data.contestId) {
      throw new Error('Contest code already taken')
    }

    return await prisma.contest.update({
      where: { id: data.contestId },
      data: {
        title: data.title,
        code: normalizedCode,
      },
    })
  })

export const Route = createFileRoute('/admin/contests/$contestId/edit')({
  component: EditContest,
  loader: async ({ params }) => await getContestFn({ data: { contestId: params.contestId } }),
})

function EditContest() {
  const contest = Route.useLoaderData()
  const navigate = useNavigate()
  const [title, setTitle] = useState(contest.title)
  const [code, setCode] = useState(contest.code)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateContestFn({
        data: {
          contestId: contest.id,
          title,
          code,
        },
      })

      navigate({ to: '/admin/contests/$contestId', params: { contestId: contest.id } })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="link"
        className="text-slate-400 pl-0 hover:text-indigo-400"
        onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId: contest.id } })}
      >
        &larr; Back to Contest
      </Button>

      <h2 className="text-3xl font-bold">Edit Contest</h2>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Contest Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. CJ2026"
            required
            className="bg-slate-950 border-slate-800 uppercase font-mono"
          />
        </div>

        {error && <p className="text-red-400 font-medium text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId: contest.id } })}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

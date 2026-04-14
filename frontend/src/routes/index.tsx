import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { joinContestFn } from '#/server/actions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
export const Route = createFileRoute('/')({ component: App })

function App() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleJoin = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError('')
      try {
          const contestCode = await joinContestFn({ data: { name, code } })
          navigate({ to: '/$contestCode', params: { contestCode } })
      } catch (err: any) {
          setError(err?.data?.message || err?.statusMessage || err?.message || 'Something went wrong')
      } finally {
          setLoading(false)
      }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-br from-indigo-400 to-purple-500 text-transparent bg-clip-text mb-2">WeCode</h1>
            <p className="text-slate-400">Join a coding competition</p>
        </div>

        <form onSubmit={handleJoin} className="relative z-10 space-y-5">
            <div className="space-y-2">
               <Label htmlFor="name" className="text-slate-300">Your Name</Label>
               <Input 
                   id="name" 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   placeholder="e.g. Satoshi"
                   required
                   className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 h-11"
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
                   className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 font-mono tracking-widest uppercase h-11"
               />
            </div>
            {error && <p className="text-red-400 font-medium text-sm text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-transform active:scale-[0.98]">
               {loading ? "Joining..." : "Enter Arena"}
            </Button>
        </form>
      </div>
    </main>
  )
}

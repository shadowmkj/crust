import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'

const getContests = createServerFn({ method: 'GET' }).handler(async () => {
    // In a real app we would check auth here and filter by user ID. 
    // Since this is just MVP, we fetch all contests.
    return await prisma.contest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { problems: true, participants: true }
            }
        }
    })
})

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  loader: async () => await getContests(),
})

function AdminDashboard() {
  const contests = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Contests</h2>
        <Link to="/admin/contests/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                + Create Contest
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                No contests found. Get started by creating one.
            </div>
        ) : (
            contests.map(contest => (
                <div key={contest.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700 transition duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{contest.title}</h3>
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-mono">{contest.code}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400 mb-6 font-medium">
                        <span>{contest._count.problems} Problems</span>
                        <span>{contest._count.participants} Participants</span>
                    </div>
                    <Link to="/admin/contests/$contestId" params={{ contestId: contest.id }} className="block w-full">
                        <Button variant="outline" className="w-full border-slate-700 text-slate-100 hover:bg-slate-800 hover:text-white">
                            Manage Contest
                        </Button>
                    </Link>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

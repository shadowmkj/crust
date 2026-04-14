import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { useState } from 'react'

type LanguageId = 'c' | 'cpp' | 'java' | 'python'

const STARTER_SNIPPETS: Record<LanguageId, string> = {
  c: `#include <stdio.h>

int main(void) {
    return 0;
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    return 0;
}`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
    }
}`,
  python: `import sys


def main():
    pass


if __name__ == '__main__':
    main()`,
}

const getProblemFn = createServerFn({ method: 'GET' })
  .inputValidator((d: { contestId: string; problemId: string }) => d)
  .handler(async ({ data }) => {
    const problem = await prisma.problem.findFirst({
      where: {
        id: data.problemId,
        contestId: data.contestId,
      },
    })

    if (!problem) throw new Error('Problem not found')
    return problem
  })

const updateProblemFn = createServerFn({ method: 'POST' })
  .inputValidator((d: {
    contestId: string
    problemId: string
    title: string
    description: string
    starterLanguage: LanguageId
    starterCode: string
  }) => d)
  .handler(async ({ data }) => {
    return await prisma.problem.update({
      where: { id: data.problemId },
      data: {
        title: data.title,
        description: data.description,
        starterLanguage: data.starterLanguage,
        starterCode: data.starterCode,
      },
    })
  })

export const Route = createFileRoute('/admin/contests/$contestId/problems/$problemId/edit')({
  component: EditProblem,
  loader: async ({ params }) =>
    await getProblemFn({
      data: {
        contestId: params.contestId,
        problemId: params.problemId,
      },
    }),
})

function EditProblem() {
  const { contestId } = Route.useParams()
  const problem = Route.useLoaderData()
  const navigate = useNavigate()

  const [title, setTitle] = useState(problem.title)
  const [description, setDescription] = useState(problem.description)
  const [starterLanguage, setStarterLanguage] = useState<LanguageId>(problem.starterLanguage as LanguageId)
  const [starterCode, setStarterCode] = useState(problem.starterCode || STARTER_SNIPPETS.python)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateProblemFn({
        data: {
          contestId,
          problemId: problem.id,
          title,
          description,
          starterLanguage,
          starterCode,
        },
      })

      navigate({ to: '/admin/contests/$contestId', params: { contestId } })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="link"
        className="text-slate-400 pl-0 hover:text-indigo-400 mb-2"
        onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId } })}
      >
        &larr; Back to Contest
      </Button>

      <h2 className="text-3xl font-bold">Edit Problem</h2>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Problem Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the detailed problem statement here..."
            required
            className="bg-slate-950 border-slate-800 min-h-[200px] focus-visible:ring-indigo-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label className="text-slate-300">Starter Language</Label>
            <Select
              value={starterLanguage}
              onValueChange={(value) => {
                const nextLanguage = value as LanguageId
                setStarterLanguage(nextLanguage)
                setStarterCode((current) => {
                  if (!current.trim() || current === STARTER_SNIPPETS[starterLanguage]) {
                    return STARTER_SNIPPETS[nextLanguage]
                  }

                  return current
                })
              }}
            >
              <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-100">
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starterCode" className="text-slate-300">Starter Code</Label>
            <Textarea
              id="starterCode"
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder="Code shown to participants when they open the problem"
              className="min-h-[260px] bg-slate-950 border-slate-800 font-mono text-sm focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {error && <p className="text-red-400 font-medium text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            {loading ? 'Saving...' : 'Save Problem'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/admin/contests/$contestId', params: { contestId } })}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

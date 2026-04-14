import { useEffect, useState } from 'react'
import type { EditorProps } from '@monaco-editor/react'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

type LanguageId = 'c' | 'cpp' | 'java' | 'python'

type EditorComponent = React.ComponentType<EditorProps>

const LANGUAGE_OPTIONS: Array<{
  id: LanguageId
  label: string
  monacoLanguage: string
  starter: string
}> = [
  {
    id: 'c',
    label: 'C',
    monacoLanguage: 'c',
    starter: `#include <stdio.h>

int main(void) {
    return 0;
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    return 0;
}`,
  },
  {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    starter: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
    }
}`,
  },
  {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    starter: `import sys


def main():
    pass


if __name__ == '__main__':
    main()` ,
  },
]

const LANGUAGE_LOOKUP = Object.fromEntries(
  LANGUAGE_OPTIONS.map((option) => [option.id, option]),
) as Record<LanguageId, (typeof LANGUAGE_OPTIONS)[number]>

type CachedEditorState = {
  language: LanguageId
  snippets: Record<LanguageId, string>
}

type CodeEditorProps = {
  storageKey: string
  initialLanguage?: LanguageId
  initialCode?: string
}

function isLanguageId(value: unknown): value is LanguageId {
  return value === 'c' || value === 'cpp' || value === 'java' || value === 'python'
}

function buildDefaultSnippets() {
  return {
    c: LANGUAGE_LOOKUP.c.starter,
    cpp: LANGUAGE_LOOKUP.cpp.starter,
    java: LANGUAGE_LOOKUP.java.starter,
    python: LANGUAGE_LOOKUP.python.starter,
  }
}

function buildEditorState(initialLanguage?: LanguageId, initialCode?: string): CachedEditorState {
  const language = initialLanguage && isLanguageId(initialLanguage) ? initialLanguage : 'python'
  const snippets = buildDefaultSnippets()

  if (initialCode?.trim()) {
    snippets[language] = initialCode
  }

  return {
    language,
    snippets,
  }
}

function getStarterForLanguage(
  language: LanguageId,
  initialLanguage?: LanguageId,
  initialCode?: string,
) {
  if (initialCode?.trim() && initialLanguage === language) {
    return initialCode
  }

  return LANGUAGE_LOOKUP[language].starter
}

export default function CodeEditor({ storageKey, initialLanguage, initialCode }: CodeEditorProps) {
  const [Editor, setEditor] = useState<EditorComponent | null>(null)
  const initialState = buildEditorState(initialLanguage, initialCode)
  const [language, setLanguage] = useState<LanguageId>(initialState.language)
  const [snippets, setSnippets] = useState<Record<LanguageId, string>>(initialState.snippets)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let isMounted = true

    void import('@monaco-editor/react').then((module) => {
      if (isMounted) {
        setEditor(() => module.default)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return

      const parsed = JSON.parse(raw) as Partial<CachedEditorState>
      if (parsed.language && isLanguageId(parsed.language)) {
        setLanguage(parsed.language)
      }
      if (parsed.snippets && typeof parsed.snippets === 'object') {
        setSnippets((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(parsed.snippets).filter(
              ([key, value]) => isLanguageId(key) && typeof value === 'string',
            ),
          ) as Partial<Record<LanguageId, string>>,
        }))
      }
    } catch {
      // Ignore bad cached data and fall back to the starter templates.
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return

    const payload: CachedEditorState = {
      language,
      snippets,
    }

    window.localStorage.setItem(storageKey, JSON.stringify(payload))
  }, [hydrated, language, snippets, storageKey])

  const activeLanguage = LANGUAGE_LOOKUP[language]
  const activeCode = snippets[language]
  const starterLabel = initialCode?.trim() && initialLanguage === language ? 'problem starter' : 'template'

  return (
    <section className="flex h-full min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_54px_rgba(23,58,64,0.12)]">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] bg-[var(--header-bg)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="island-kicker mb-1">Code Editor</p>
          <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Write in your preferred language</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="min-w-[11rem]">
            <Select value={language} onValueChange={(value) => setLanguage(value as LanguageId)}>
              <SelectTrigger className="w-full bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="hidden rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)] sm:inline-flex">
            {activeLanguage.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between text-xs text-[var(--sea-ink-soft)]">
          <span>Monaco mode: {activeLanguage.monacoLanguage}</span>
          <span>Starter {starterLabel} loaded for {activeLanguage.label}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[var(--line)] bg-[#0f1726]">
          {Editor ? (
            <Editor
              key={language}
              height="100%"
              language={activeLanguage.monacoLanguage}
              value={activeCode}
              onChange={(value) => {
                setSnippets((current) => ({
                  ...current,
                  [language]: value ?? '',
                }))
              }}
              theme="vs-dark"
              loading={<div className="flex h-full min-h-[420px] items-center justify-center text-sm text-slate-400">Loading editor...</div>}
              options={{
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 14, bottom: 14 },
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
              }}
              className="h-full min-h-[420px]"
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center bg-[#0f1726] text-sm text-slate-400">
              Preparing Monaco editor...
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3">
          <div className="text-sm text-[var(--sea-ink-soft)]">
            Supports C, C++, Java, and Python with language-aware highlighting.
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSnippets((current) => ({
                ...current,
                [language]: getStarterForLanguage(language, initialLanguage, initialCode),
              }))
            }}
            className="border-[var(--chip-line)] bg-transparent text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]"
          >
            Reset starter code
          </Button>
        </div>
      </div>
    </section>
  )
}
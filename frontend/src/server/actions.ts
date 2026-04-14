import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { createError } from 'vinxi/server'
import { prisma } from '#/db'
import { signParticipantToken, verifyParticipantToken } from '#/lib/jwt'
import { auth } from '#/lib/auth'

const requestContextMiddleware = createMiddleware().server(async ({ next, request }) => {
    return next({
        context: { request },
    })
})

function getCookieValue(cookieHeader: string | null, name: string) {
}

export const getAdminSessionFn = createServerFn({ method: 'GET' })
    .middleware([requestContextMiddleware])
    .handler(async ({ context }) => {
        const session = await auth.api.getSession({ headers: context.request.headers })
    if (!session) return null
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }
    }
  })


// Plain serializable type for participant context (no JWTPayload extends)
export type ParticipantSession = {
  participantId: string
  contestId: string
  contestCode: string
  name: string
}

export const joinContestFn = createServerFn({ method: "POST" })
    .inputValidator((d: { name: string; code: string }) => d)
    .handler(async ({ data }) => {
        const contest = await prisma.contest.findUnique({ where: { code: data.code } })
        if (!contest) {
            throw createError({ statusCode: 404, statusMessage: 'Invalid contest code' })
        }

        const participant = await prisma.participant.create({
            data: {
                name: data.name,
                contestId: contest.id,
            }
        })

        const token = await signParticipantToken({
            participantId: participant.id,
            contestId: contest.id,
            contestCode: contest.code,
            name: data.name
        })

        setCookie('wecode_participant', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        return contest.code
    })

export const verifyParticipantFn = createServerFn({ method: 'GET' })
    .inputValidator((d: { contestCode: string }) => d)
    .middleware([requestContextMiddleware])
    .handler(async ({ data, context }): Promise<ParticipantSession | null> => {
        const token = getCookie('wecode_participant')
        if (!token) return null

        const payload = await verifyParticipantToken(token)
        if (!payload || payload.contestCode !== data.contestCode) {
            return null
        }
        // Return only plain serializable fields
        return {
            participantId: payload.participantId,
            contestId: payload.contestId,
            contestCode: payload.contestCode,
            name: payload.name,
        }
    })

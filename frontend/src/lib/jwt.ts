import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET 
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : new TextEncoder().encode('default_insecure_development_secret_do_not_use_in_prod')

export interface ParticipantPayload extends JWTPayload {
  participantId: string
  contestId: string
  contestCode: string
  name: string
}

export async function signParticipantToken(payload: Omit<ParticipantPayload, 'exp' | 'iat'>) {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Competitions generally don't last longer than 24h
    .sign(JWT_SECRET)

  return token
}

export async function verifyParticipantToken(token: string): Promise<ParticipantPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as ParticipantPayload
  } catch (error) {
    return null
  }
}

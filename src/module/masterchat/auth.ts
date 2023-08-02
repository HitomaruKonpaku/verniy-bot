import sha1 from 'sha1'
import { DO, SASH, XO } from './constants'
import { Credentials } from './interfaces'

function genCookieString(creds: Credentials) {
  return Object.entries(creds)
    .map(([key, value]) => `${key}=${value};`)
    .join(' ')
}

function sha1Digest(payload: string): string {
  const hash = sha1(payload)
  return hash.toString()
}

function genSash(sid: string, origin: string): string {
  const now = Math.floor(new Date().getTime() / 1e3)
  const payload = [now, sid, origin]
  const digest = sha1Digest(payload.join(' '))
  return [now, digest].join('_')
}

function genAuthToken(sid: string, origin: string): string {
  return `${SASH} ${genSash(sid, origin)}`
}

export function buildAuthHeaders(creds: Credentials): Record<string, string> {
  const headers = {
    Authorization: genAuthToken(creds.SAPISID, DO),
    Cookie: genCookieString(creds),
    [XO]: DO,
  }
  return headers
}

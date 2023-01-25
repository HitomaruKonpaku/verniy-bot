export type TwitterAuthHeaders = {
  authorization: string
}

export type TwitterAuthCookieHeaders = TwitterAuthHeaders & {
  cookie: string
}

export type TwitterAuthGuestTokenHeaders = TwitterAuthHeaders & {
  'x-guest-token': string
}

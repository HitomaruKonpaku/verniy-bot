export interface Status {
  source: {
    location: string
    noRedirectPlaybackUrl: string
    status: string
    streamType: string
  }
  sessionId: string
  chatToken: string
  lifecycleToken: string
  shareUrl: string
  chatPermissionType: string
}

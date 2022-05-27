import Bottleneck from 'bottleneck'

export const twitchAccessTokenLimiter = new Bottleneck({ maxConcurrent: 1 })

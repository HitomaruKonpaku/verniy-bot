import Bottleneck from 'bottleneck'

export const instagramUserLimiter = new Bottleneck({ maxConcurrent: 1 })

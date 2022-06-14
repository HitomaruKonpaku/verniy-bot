import Bottleneck from 'bottleneck'

export const instagramUserLimiter = new Bottleneck({ maxConcurrent: 1 })

export const instagramUserStoriesLimiter = new Bottleneck({ maxConcurrent: 1 })

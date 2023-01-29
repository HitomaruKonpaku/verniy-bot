import Bottleneck from 'bottleneck'

export const youtubeFeedVideoLimiter = new Bottleneck({
  maxConcurrent: 5,
})

export const youtubeiInfoLimiter = new Bottleneck({
  maxConcurrent: 5,
})

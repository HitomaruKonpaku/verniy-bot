import Bottleneck from 'bottleneck'

export const tiktokUserLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2000,
})

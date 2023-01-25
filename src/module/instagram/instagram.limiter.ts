import Bottleneck from 'bottleneck'

export const instagramUserLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 5000,
})

export const instagramUserStoriesLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 5000,
})

export const instagramTrackingQueueLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 10000,
})

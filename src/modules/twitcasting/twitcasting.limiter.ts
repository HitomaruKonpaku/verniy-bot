import Bottleneck from 'bottleneck'

const reservoirRefreshInterval = 60 * 1000

export const twitCastingUserByIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval,
})

export const twitCastingMovieByIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval,
})

export const twitCastingMoviesByUserIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval,
})

export const twitCastingStreamServerLimiter = new Bottleneck({
  maxConcurrent: 3,
})

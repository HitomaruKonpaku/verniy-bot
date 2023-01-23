import Bottleneck from 'bottleneck'

const reservoirRefreshInterval = 60 * 1000
const reservoirRefreshAmount = 60

export const twitCastingUserByIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshInterval,
  reservoirRefreshAmount,
})

export const twitCastingMovieByIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshInterval,
  reservoirRefreshAmount,
})

export const twitCastingMoviesByUserIdLimiter = new Bottleneck({
  maxConcurrent: 1,
  reservoir: 60,
  reservoirRefreshInterval,
  reservoirRefreshAmount,
})

export const twitCastingStreamServerLimiter = new Bottleneck({
  maxConcurrent: 3,
})

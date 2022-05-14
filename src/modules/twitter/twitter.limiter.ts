import Bottleneck from 'bottleneck'

export const twitterGuestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-id
 */
export const twitterSpaceLimiter = new Bottleneck({
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval: 15 * 60 * 1000,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces
 */
export const twitterSpacesByIdsLimiter = new Bottleneck({
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval: 15 * 60 * 1000,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-by-creator-ids
 */
export const twitterSpacesByCreatorIdsLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval: 15 * 60 * 1000,
})

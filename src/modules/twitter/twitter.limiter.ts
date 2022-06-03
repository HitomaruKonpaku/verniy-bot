import Bottleneck from 'bottleneck'

const reservoirRefreshInterval = 15 * 60 * 1000

export const twitterGuestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-show
 */
export const twitterUserShowLimiter = new Bottleneck({
  maxConcurrent: 5,
  reservoir: 900,
  reservoirRefreshAmount: 900,
  reservoirRefreshInterval,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-lookup
 */
export const twitterUserLookupLimiter = new Bottleneck({
  maxConcurrent: 5,
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-id
 */
export const twitterSpaceLimiter = new Bottleneck({
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces
 */
export const twitterSpacesByIdsLimiter = new Bottleneck({
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval,
})

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-by-creator-ids
 */
export const twitterSpacesByCreatorIdsLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval,
})

export const twitterSpacesByFleetsAvatarContentLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 300,
})

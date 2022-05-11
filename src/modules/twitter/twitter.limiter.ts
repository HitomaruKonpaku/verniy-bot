import Bottleneck from 'bottleneck'

const options: Bottleneck.ConstructorOptions = {
  maxConcurrent: 1,
  minTime: 1000,
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval: 15 * 60 * 1000,
}

export const twitterSpacesByIdsLimiter = new Bottleneck(options)
export const twitterSpacesByCreatorIdsLimiter = new Bottleneck(options)

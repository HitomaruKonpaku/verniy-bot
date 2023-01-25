import { TWITTER_STREAM_RULE_LENGTH, TWITTER_STREAM_RULE_LIMIT } from '../../twitter/constant/twitter.constant'

export const twitterConfig = {
  active: false,

  tweet: {
    active: false,
    /**
     * @see https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api
     */
    ruleLimit: TWITTER_STREAM_RULE_LIMIT,
    /**
     * @see https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api
     */
    ruleLength: TWITTER_STREAM_RULE_LENGTH,
  },

  profile: {
    active: false,
    interval: 60000,
  },

  space: {
    active: false,
    interval: 60000,
  },

  cron: {
    active: false,
  },
}

import Twit from 'twit'
import { Util } from './Util'

export class TwitterUtil {
  public static getConfig() {
    return Util.getConfig().twitter || {}
  }

  public static getTweetConfig() {
    return TwitterUtil.getConfig().tweet || {}
  }

  public static getProfileConfig() {
    return TwitterUtil.getConfig().profile || {}
  }

  public static getTweetUrl(tweet: Twit.Twitter.Status): string {
    // Fix retweet not show embed by discord
    const host = tweet.retweeted_status && tweet.text?.startsWith?.('RT @')
      ? 'fxtwitter.com'
      : 'twitter.com'
    const url = `https://${host}/${tweet.user.screen_name}/status/${tweet.id_str}`
    return url
  }

  public static getInReplyToTweetUrl(tweet: Twit.Twitter.Status): string {
    const host = 'twitter.com'
    const url = `https://${host}/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`
    return url
  }

  public static getProfileDefaultInterval(): number {
    const interval = Number(TwitterUtil.getProfileConfig().interval) || 30000
    return interval
  }
}

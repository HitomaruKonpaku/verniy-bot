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
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  }

  public static getProfileDefaultInterval(): number {
    const interval = Number(TwitterUtil.getProfileConfig().interval) || 30000
    return interval
  }
}

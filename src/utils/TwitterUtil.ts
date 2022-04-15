import Twit from 'twit'
import { configManager } from '../modules/config/ConfigManager'

export class TwitterUtil {
  public static getTweetUrl(tweet: Twit.Twitter.Status): string {
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    return url
  }

  public static getInReplyToTweetUrl(tweet: Twit.Twitter.Status): string {
    const url = `https://twitter.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`
    return url
  }

  public static getProfileRefreshInterval(): number {
    const interval = Number(configManager.twitterProfileInterval) || 60000
    return interval
  }
}

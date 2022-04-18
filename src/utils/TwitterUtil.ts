import Twit from 'twit'
import { configManager } from '../modules/config/ConfigManager'

export class TwitterUtil {
  public static getProfileRefreshInterval(): number {
    const interval = Number(configManager.twitterProfileInterval) || 60000
    return interval
  }

  public static getTweetUrl(tweet: Twit.Twitter.Status): string {
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    return url
  }

  public static getInReplyToTweetUrl(tweet: Twit.Twitter.Status): string {
    const url = `https://twitter.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`
    return url
  }

  public static getUserDescription(user: Twit.Twitter.User): string {
    const entities = user?.entities as any
    const urls = entities?.description?.urls as Twit.Twitter.UrlEntity[] || []
    let desc = user?.description || ''
    if (urls.length) {
      urls.forEach((v) => {
        desc = desc.replace(v.url, v.expanded_url)
      })
    }
    return desc
  }
}

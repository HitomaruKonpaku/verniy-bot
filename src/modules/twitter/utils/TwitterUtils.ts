import Twit from 'twit'

export class TwitterUtils {
  /**
    * Returns the URL of a Twitter user, provided their username
    * @param {string} username - Username
    * @returns {string} User URL
    */
  public static getUserUrl(username: string): string {
    return `https://twitter.com/${username}`
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
    const desc = user?.description || ''
    // const entities = user?.entities as any
    // const urls = entities?.description?.urls as Twit.Twitter.UrlEntity[] || []
    // if (urls.length) {
    //   urls.forEach((v) => {
    //     desc = desc.replace(v.url, v.expanded_url)
    //   })
    // }
    return desc
  }

  public static getUserProfileImageUrl(user: Twit.Twitter.User): string {
    const url = user?.profile_image_url_https?.replace?.('_normal', '') || null
    return url
  }

  public static getUserProfileBannerUrl(user: Twit.Twitter.User): string {
    const url = user?.profile_banner_url || null
    return url
  }
}

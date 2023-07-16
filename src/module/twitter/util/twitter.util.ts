import { TweetV2SingleStreamResult, UserV1 } from 'twitter-api-v2'
import { TwitterTweet } from '../model/twitter-tweet.entity'

export class TwitterUtil {
  /**
    * Returns the URL of a Twitter user, provided their username
    * @param {string} username - Username
    * @returns {string} User URL
    */
  public static getUserUrl(username: string): string {
    return `https://twitter.com/${username}`
  }

  public static getTweetUrl(username: string, tweetId: string): string {
    // return `https://fxtwitter.com/${username}/status/${tweetId}`
    return `https://twitter.com/${username}/status/${tweetId}`
  }

  public static getTweetUrlById(tweetId: string): string {
    return TwitterUtil.getTweetUrl('i', tweetId)
  }

  public static getTweetUrlByTweet(tweet: TwitterTweet): string {
    return tweet.author
      ? TwitterUtil.getTweetUrl(tweet.author.username, tweet.id)
      : TwitterUtil.getTweetUrlById(tweet.id)
  }

  public static getSpaceUrl(spaceId: string): string {
    return `https://twitter.com/i/spaces/${spaceId}`
  }

  public static getIncludesUserById(data: TweetV2SingleStreamResult, id: string) {
    return data.includes?.users?.find?.((v) => v?.id === id)
  }

  public static getIncludesTweetById(data: TweetV2SingleStreamResult, id: string) {
    return data.includes?.tweets?.find?.((v) => v?.id === id)
  }

  public static isReplyStatus(data: TweetV2SingleStreamResult): boolean {
    return !!data.data?.referenced_tweets?.some?.((v) => v?.type === 'replied_to')
  }

  public static isRetweetStatus(data: TweetV2SingleStreamResult): boolean {
    return !!data.data?.referenced_tweets?.some?.((v) => v?.type === 'retweeted')
  }

  public static getReplyStatusUrl(data: TweetV2SingleStreamResult) {
    const tweetId = data.data.referenced_tweets.find((v) => v.type === 'replied_to').id
    const tweet = this.getIncludesTweetById(data, tweetId)
    const author = this.getIncludesUserById(data, tweet.author_id)
    return this.getTweetUrl(author.username, tweetId)
  }

  public static getRetweetStatusUrl(data: TweetV2SingleStreamResult) {
    const tweetId = data.data.referenced_tweets.find((v) => v.type === 'retweeted').id
    const tweet = this.getIncludesTweetById(data, tweetId)
    const author = this.getIncludesUserById(data, tweet.author_id)
    return this.getTweetUrl(author.username, tweetId)
  }

  public static getTweetEntityUrls(tweet: TwitterTweet) {
    const entities = tweet?.entities
    const urls = entities?.urls?.map?.((v) => v.expanded_url) || []
    return urls
  }

  public static getTweetV2EntityUrls(data: TweetV2SingleStreamResult) {
    const entities = data.data?.entities
    const urls = entities?.urls?.map?.((v) => v.expanded_url) || []
    return urls
  }

  public static getUserDescription(user: UserV1): string {
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

  public static getUserProfileImageUrl(baseUrl: string): string {
    const url = baseUrl?.replace?.('_normal', '') || null
    return url
  }

  public static getUserProfileBannerUrl(baseUrl: string): string {
    const url = baseUrl || null
    return url
  }
}

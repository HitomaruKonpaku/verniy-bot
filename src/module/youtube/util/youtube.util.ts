export class YoutubeUtil {
  public static getChannelUrl(id: string) {
    return `https://www.youtube.com/channel/${id}`
  }

  public static getVideoUrl(id: string) {
    return `https://www.youtube.com/watch?v=${id}`
  }

  public static getPostUrl(id: string) {
    return `https://www.youtube.com/post/${id}`
  }

  public static parseDate(str: string): number {
    if (str === undefined) {
      return undefined
    }
    if (str === null) {
      return null
    }
    if (!str) {
      return 0
    }
    const ms = new Date(str).getTime()
    return ms
  }
}

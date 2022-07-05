export class YoutubeUtils {
  public static getChannelUrl(id: string) {
    return `https://www.youtube.com/channel/${id}`
  }

  public static getVideoUrl(id: string) {
    return `https://www.youtube.com/watch?v=${id}`
  }
}

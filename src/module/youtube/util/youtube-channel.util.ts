export class YoutubeChannelUtil {
  public static parseId(s: string): string {
    const pattern = /UC[\w-_]+/
    const value = pattern.exec(s)?.[0] || s
    return value
  }
}

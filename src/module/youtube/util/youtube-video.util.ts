export class YoutubeVideoUtil {
  public static parseId(s: string): string {
    const pattern = /(?<=v=|\/)[\w-]{11}/
    const value = pattern.exec(s)?.[0] || s
    return value
  }
}

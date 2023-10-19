export class TwitterBroadcastUtil {
  public static parseId(s: string): string {
    const pattern = /(?<=broadcasts\/)\w+/
    const value = pattern.exec(s)?.[0] || s
    return value
  }
}

export class TwitterUserUtil {
  public static parseUsername(s: string): string {
    const pattern = /(?<=twitter\.com\/)\w+/
    const value = pattern.exec(s)?.[0] || s
    return value
  }
}

export class TwitterSpaceUtils {
  public static getMasterPlaylistUrl(url: string) {
    return url
      .replace('?type=live', '')
      .replace('dynamic', 'master')
  }
}

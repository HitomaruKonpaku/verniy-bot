export class AppUtils {
  public static sleep(ms?: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public static getCommitUrl(hash: string) {
    return `https://github.com/HitomaruKonpaku/verniy-bot/commit/${hash}`
  }
}

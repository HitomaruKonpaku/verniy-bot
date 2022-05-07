export class Utils {
  public static sleep(ms?: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public static splitArrayIntoChunk<T>(arr: T[], chunkSize: number) {
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }
}

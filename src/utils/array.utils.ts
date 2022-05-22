export class ArrayUtils {
  public static splitIntoChunk<T>(array: T[], chunkSize: number) {
    const arr = Array.from(array)
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }
}

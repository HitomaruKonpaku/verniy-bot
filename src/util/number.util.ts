export class NumberUtil {
  public static toNumberOrUndefined(value: unknown) {
    const tmp = Number(value)
    if (tmp === 0) {
      return tmp
    }
    return tmp || undefined
  }
}

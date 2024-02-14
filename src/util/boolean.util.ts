export class BooleanUtil {
  public static toNumberStr(value: unknown) {
    switch (value) {
      case true:
        return '1'
      case false:
        return '0'
      default:
        return null
    }
  }
}

export class StringUtils {
  public static getEscapeValue(s: string, escapeCharacter = '!') {
    return s.replace(/[_]/g, (v) => `${escapeCharacter}${v}`)
  }
}

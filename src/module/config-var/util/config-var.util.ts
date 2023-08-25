import { ConfigVarType } from '../enum/config-var-type.enum'

export class ConfigVarUtil {
  public static toString(value: boolean | number | string): string {
    if (typeof value === 'boolean') {
      return ConfigVarUtil.toBoleanString(value)
    }
    return value.toString()
  }

  public static toBoleanString(value: boolean): '0' | '1' {
    return value ? '1' : '0'
  }

  public static fromString(value: any, type: ConfigVarType): boolean | number | string {
    if (type === ConfigVarType.BOOLEAN) {
      return ConfigVarUtil.fromBooleanString(value)
    }
    if (type === ConfigVarType.NUMBER) {
      return Number(value)
    }
    return value
  }

  public static fromBooleanString(value: string): boolean {
    return value !== '0'
  }
}

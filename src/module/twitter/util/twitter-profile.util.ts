import { hideLinkEmbed, inlineCode } from 'discord.js'
import { EmojiUtil } from '../../../util/emoji.util'

export class TwitterProfileUtil {
  public static getBoolIcon(value: boolean): string {
    return EmojiUtil.fromBool(value)
  }

  public static getStringOldLine(value: string): string {
    return ['❌', value ? inlineCode(value) : null]
      .filter((v) => v).join(' ').trim()
  }

  public static getStringNewLine(value: string): string {
    return ['➡️', value ? inlineCode(value) : null]
      .filter((v) => v).join(' ').trim()
  }

  public static getUrlOldLine(value: string): string {
    return ['❌', value ? hideLinkEmbed(value) : null]
      .filter((v) => v).join(' ').trim()
  }

  public static getUrlNewLine(value: string): string {
    return ['➡️', value ? hideLinkEmbed(value) : null]
      .filter((v) => v).join(' ').trim()
  }
}

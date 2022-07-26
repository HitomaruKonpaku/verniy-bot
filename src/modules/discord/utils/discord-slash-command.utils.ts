import { SlashCommandStringOption } from 'discord.js'

interface OptionConfig {
  name?: string
  description?: string
  required?: boolean
}

export class DiscordSlashCommandUtils {
  public static getIdOption(option: SlashCommandStringOption, config?: OptionConfig) {
    return option
      .setName('username')
      .setDescription(config?.description ?? 'Id')
      .setRequired(config?.required ?? true)
  }

  public static getUsernameOption(option: SlashCommandStringOption, config?: OptionConfig) {
    return option
      .setName('username')
      .setDescription(config?.description ?? 'Username')
      .setRequired(config?.required ?? true)
  }

  public static getMessageOption(option: SlashCommandStringOption) {
    return option
      .setName('message')
      .setDescription('Discord message')
  }
}

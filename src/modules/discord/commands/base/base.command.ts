/* eslint-disable class-methods-use-this */
import { bold, codeBlock, inlineCode } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

export abstract class BaseCommand {
  protected async isAppOwner(interaction: CommandInteraction) {
    const app = await interaction.client.application.fetch()
    return app.owner.id === interaction.user.id
  }

  protected async replyOwnerOnly(interaction: CommandInteraction) {
    const content = 'Owner only!'
    await interaction.editReply(content)
  }

  protected async replyMissingPermission(interaction: CommandInteraction, permissionName: string) {
    const content = `You must have ${bold(inlineCode(permissionName))} permission to run this command!`
    await interaction.editReply(content)
  }

  protected async replyObject<T>(interaction: CommandInteraction, data: T) {
    await interaction.editReply({ content: codeBlock('json', JSON.stringify(data, null, 2)) })
  }
}

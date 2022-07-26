/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import { BaseExternalEntity } from '../../../../database/models/base-external.entity'
import { Track } from '../../../../track/models/track.entity'
import { TrackBaseService } from '../../../../track/services/base/track-base.service'
import { BaseCommand } from '../../base/base-command'

export abstract class TrackRemoveBaseSubcommand extends BaseCommand {
  protected abstract readonly trackService: TrackBaseService<Track>

  protected abstract getUser(username: string): Promise<BaseExternalEntity>

  public async execute(interaction: ChatInputCommandInteraction) {
    const { username, channelId } = this.getInteractionBaseOptions(interaction)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.getUser(username)
      if (!user) {
        this.logger.warn('execute: user not found', meta)
        this.replyUserNotFound(interaction)
        return
      }

      await this.trackService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await this.onSuccess(interaction, user)
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }

  protected async onSuccess(interaction: ChatInputCommandInteraction, user: BaseExternalEntity) {
    const embed: APIEmbed = {
      description: this.getSuccessEmbedDescription(user),
      color: this.getSuccessEmbedColor(user),
    }
    await interaction.editReply({ embeds: [embed] })
  }

  protected getSuccessEmbedDescription(user: BaseExternalEntity): string {
    return '✅'
  }

  protected getSuccessEmbedColor(user: BaseExternalEntity): number {
    return 0x1d9bf0
  }

  protected getInteractionBaseOptions(interaction: ChatInputCommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    return { username, channelId }
  }
}

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ColorResolvable, CommandInteraction, MessageEmbedOptions } from 'discord.js'
import winston from 'winston'
import { BaseExternalEntity } from '../../../../database/models/base-external.entity'
import { Track } from '../../../../track/base/track.entity'
import { TrackService } from '../../../../track/base/track.service'
import { BaseCommand } from '../../base/base.command'

export abstract class TrackRemoveBaseSubcommand extends BaseCommand {
  protected abstract readonly logger: winston.Logger

  protected abstract readonly trackService: TrackService<Track>

  protected abstract getUser(username: string): Promise<BaseExternalEntity>

  public async execute(interaction: CommandInteraction) {
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

      const embed: MessageEmbedOptions = {
        description: this.getSuccessEmbedDescription(user),
        color: this.getSuccessEmbedColor(user),
      }
      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }

  protected getSuccessEmbedDescription(user: BaseExternalEntity): string {
    return '✅'
  }

  protected getSuccessEmbedColor(user: BaseExternalEntity): ColorResolvable {
    return 0x1d9bf0
  }

  protected getInteractionBaseOptions(interaction: CommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    return { username, channelId }
  }
}

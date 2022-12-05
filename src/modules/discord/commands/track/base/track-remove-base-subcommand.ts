/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import { BaseExternalEntity } from '../../../../database/models/base-external.entity'
import { Track } from '../../../../track/models/base/track.entity'
import { TrackBaseService } from '../../../../track/services/base/track-base.service'
import { TrackRemoveFilter } from '../../../interfaces/track.interface'
import { BaseCommand } from '../../base/base-command'

export abstract class TrackRemoveBaseSubcommand extends BaseCommand {
  protected abstract readonly trackService: TrackBaseService<Track>

  protected abstract getUser(username: string): Promise<BaseExternalEntity>

  public async execute(interaction: ChatInputCommandInteraction) {
    const options = this.getInteractionBaseOptions(interaction)
    const meta = { ...options }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.getUser(options.username)
      if (!user) {
        this.logger.warn('execute: user not found', meta)
        await this.replyUserNotFound(interaction)
        return
      }

      const filterUser = options.filterUsername
        ? await this.getUser(options.filterUsername)
        : null
      if (options.filterUsername && !filterUser) {
        this.logger.warn('execute: filterUser not found', meta)
        await this.replyUserNotFound(interaction)
        return
      }

      await this.trackService.remove(
        user.id,
        options.channelId,
        {
          filterUserId: filterUser?.id || '',
        },
        interaction.user.id,
      )
      this.logger.warn('execute: removed', meta)

      await this.onSuccess(interaction, user, { user: filterUser })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }

  protected async onSuccess(
    interaction: ChatInputCommandInteraction,
    user: BaseExternalEntity,
    filter?: TrackRemoveFilter<BaseExternalEntity>,
  ) {
    const embed: APIEmbed = {
      description: this.getSuccessEmbedDescription(user, filter),
      color: this.getSuccessEmbedColor(user),
    }
    await interaction.editReply({ embeds: [embed] })
  }

  protected getSuccessEmbedDescription(
    user: BaseExternalEntity,
    filter?: TrackRemoveFilter<BaseExternalEntity>,
  ): string {
    return '✅'
  }

  protected getSuccessEmbedColor(user: BaseExternalEntity): number {
    return 0x1d9bf0
  }

  protected getInteractionBaseOptions(interaction: ChatInputCommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    let filterUsername = interaction.options.getString('filter_username', false) || ''

    if (username.toLowerCase() === filterUsername?.toLowerCase()) {
      filterUsername = ''
    }

    return {
      username,
      channelId,
      filterUsername,
    }
  }
}

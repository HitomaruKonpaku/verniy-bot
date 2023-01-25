/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction } from 'discord.js'
import { BaseExternalEntity } from '../../../../database/model/base-external.entity'
import { Track } from '../../../../track/model/base/track.entity'
import { TrackBaseService } from '../../../../track/service/base/track-base.service'
import { TrackAddFilter } from '../../../interface/track.interface'
import { BaseCommand } from '../../base/base-command'

export abstract class TrackAddBaseSubcommand extends BaseCommand {
  protected abstract readonly trackService: TrackBaseService<Track>

  protected abstract getUser(username: string): Promise<BaseExternalEntity>

  public async execute(interaction: ChatInputCommandInteraction) {
    const options = this.getInteractionBaseOptions(interaction)
    const meta = { ...options }
    delete meta.message
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

      if (!this.isUserTrackable(user)) {
        if (!await this.isAppOwner(interaction)) {
          this.logger.warn('execute: user untrackable', meta)
          await interaction.editReply(this.getUntrackableMessage(user))
          return
        }
      }

      await this.trackService.add(
        user.id,
        options.channelId,
        options.message,
        {
          updatedBy: interaction.user.id,
          filterUserId: filterUser?.id || '',
          filterKeywords: options.filterKeywords,
        },
      )
      this.logger.warn('execute: added', meta)

      await this.onSuccess(interaction, user, { user: filterUser, keywords: options.filterKeywords })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }

  protected async onSuccess(
    interaction: ChatInputCommandInteraction,
    user: BaseExternalEntity,
    filter?: TrackAddFilter<BaseExternalEntity>,
  ) {
    const embed: APIEmbed = {
      description: this.getSuccessEmbedDescription(user, filter),
      color: this.getSuccessEmbedColor(user),
    }
    await interaction.editReply({ embeds: [embed] })
  }

  protected isUserTrackable(user: BaseExternalEntity): boolean | Promise<boolean> {
    return true
  }

  protected getUntrackableMessage(user: BaseExternalEntity): string {
    return 'Unable to track this user!'
  }

  protected getSuccessEmbedDescription(
    user: BaseExternalEntity,
    filter?: TrackAddFilter<BaseExternalEntity>,
  ): string {
    return '✅'
  }

  protected getSuccessEmbedColor(user: BaseExternalEntity): number {
    return 0x1d9bf0
  }

  protected getInteractionBaseOptions(interaction: ChatInputCommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    const message = interaction.options.getString('message') || null
    let filterUsername = interaction.options.getString('filter_username', false) || ''
    let filterKeywords = interaction.options.getString('filter_keywords', false)?.split?.(',')?.filter?.((v) => v) || null

    if (username.toLowerCase() === filterUsername?.toLowerCase()) {
      filterUsername = ''
    }
    if (!filterKeywords?.length) {
      filterKeywords = null
    }

    return {
      username,
      channelId,
      message,
      filterUsername,
      filterKeywords,
    }
  }
}

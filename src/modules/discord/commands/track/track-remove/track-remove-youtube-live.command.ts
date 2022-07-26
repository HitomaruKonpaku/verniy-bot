/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackYoutubeLiveService } from '../../../../track/services/track-youtube-live.service'
import { YoutubeChannel } from '../../../../youtube/models/youtube-channel.entity'
import { YoutubeChannelService } from '../../../../youtube/services/data/youtube-channel.service'
import { YoutubeUtils } from '../../../../youtube/utils/youtube.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveYoutubeLiveCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveYoutubeLiveCommand.name })

  constructor(
    @Inject(TrackYoutubeLiveService)
    protected readonly trackService: TrackYoutubeLiveService,
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.YOUTUBE_LIVE)
      .setDescription('Untrack channel live')
      .addStringOption((option) => option
        .setName('channel_id')
        .setDescription('YouTube channel id')
        .setRequired(true))
  }

  protected async getUser(id: string): Promise<YoutubeChannel> {
    const channel = await this.youtubeChannelService.getOneById(id)
    return channel
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const { channelId } = interaction
    const ytChannelId = interaction.options.getString('channel_id', true)
    const meta = { ytChannelId, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const channel = await this.getUser(ytChannelId)
      if (!channel) {
        this.logger.warn('execute: channel not found', meta)
        this.replyUserNotFound(interaction)
        return
      }

      await this.trackService.remove(channel.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      const embed: APIEmbed = {
        description: this.getSuccessEmbedDescription(channel),
        color: this.getSuccessEmbedColor(),
      }
      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }

  protected getSuccessEmbedDescription(channel: YoutubeChannel): string {
    return `Untrack **[${channel.name || channel.id}](${YoutubeUtils.getChannelUrl(channel.id)})** YouTube live`
  }

  protected getSuccessEmbedColor(): number {
    return 0xff0000
  }

  protected async replyUserNotFound(interaction: ChatInputCommandInteraction) {
    const content = 'Channel not found'
    await interaction.editReply(content)
  }
}

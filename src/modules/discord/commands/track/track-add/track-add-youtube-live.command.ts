/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ColorResolvable, CommandInteraction, MessageEmbedOptions } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackYoutubeLiveService } from '../../../../track/services/track-youtube-live.service'
import { YoutubeChannel } from '../../../../youtube/models/youtube-channel.entity'
import { YoutubeChannelControllerService } from '../../../../youtube/services/controller/youtube-channel-controller.service'
import { YoutubeUtils } from '../../../../youtube/utils/youtube.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddYoutubeLiveCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddYoutubeLiveCommand.name })

  constructor(
    @Inject(TrackYoutubeLiveService)
    protected readonly trackService: TrackYoutubeLiveService,
    @Inject(YoutubeChannelControllerService)
    private readonly youtubeChannelControllerService: YoutubeChannelControllerService,
  ) {
    super()
  }

  protected async getUser(id: string): Promise<YoutubeChannel> {
    const channel = await this.youtubeChannelControllerService.getOneById(id)
    return channel
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
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

      if (!await this.isUserTrackable(channel)) {
        if (!await this.isAppOwner(interaction)) {
          this.logger.warn('execute: channel untrackable', meta)
          interaction.editReply(this.getUntrackableMessage())
          return
        }
      }

      await this.trackService.add(channel.id, channelId, message, interaction.user.id)
      this.logger.warn('execute: added', meta)

      const embed: MessageEmbedOptions = {
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

  protected async isUserTrackable(channel: YoutubeChannel) {
    const canTrack = await this.trackService.existUserId(channel.id)
    return canTrack
  }

  protected getUntrackableMessage(): string {
    return 'Unable to track this channel!'
  }

  protected getSuccessEmbedDescription(channel: YoutubeChannel): string {
    return `Tracking **[${channel.name || channel.id}](${YoutubeUtils.getChannelUrl(channel.id)})** YouTube live`
  }

  protected getSuccessEmbedColor(): ColorResolvable {
    return 0xff0000
  }

  protected async replyUserNotFound(interaction: CommandInteraction) {
    const content = 'Channel not found'
    await interaction.editReply(content)
  }
}

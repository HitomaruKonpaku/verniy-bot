/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackYoutubeLiveService } from '../../../../track/service/track-youtube-live.service'
import { YoutubeChannel } from '../../../../youtube/model/youtube-channel.entity'
import { YoutubeChannelControllerService } from '../../../../youtube/service/controller/youtube-channel-controller.service'
import { YoutubeUtil } from '../../../../youtube/util/youtube.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
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

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.YOUTUBE_LIVE)
      .setDescription('Track channel live')
      .addStringOption((option) => option
        .setName('channel_id')
        .setDescription('YouTube channel id')
        .setRequired(true))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(id: string): Promise<YoutubeChannel> {
    const channel = await this.youtubeChannelControllerService.getOneById(id)
    return channel
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
    const ytChannelId = interaction.options.getString('channel_id', true)
    const meta = { ytChannelId, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const channel = await this.getUser(ytChannelId)
      if (!channel) {
        this.logger.warn('execute: channel not found', meta)
        await this.replyUserNotFound(interaction)
        return
      }

      if (!await this.isUserTrackable(channel)) {
        if (!await this.isAppOwner(interaction)) {
          this.logger.warn('execute: channel untrackable', meta)
          await interaction.editReply(this.getUntrackableMessage())
          return
        }
      }

      await this.trackService.add(
        channel.id,
        channelId,
        message,
        {
          updatedBy: interaction.user.id,
        },
      )
      this.logger.warn('execute: added', meta)

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

  protected async isUserTrackable(channel: YoutubeChannel) {
    const canTrack = await this.trackService.existUserId(channel.id)
    return canTrack
  }

  protected getUntrackableMessage(): string {
    return 'Unable to track this channel!'
  }

  protected getSuccessEmbedDescription(channel: YoutubeChannel): string {
    return `Tracking **[${channel.name || channel.id}](${YoutubeUtil.getChannelUrl(channel.id)})** YouTube live`
  }

  protected getSuccessEmbedColor(): number {
    return 0xff0000
  }

  protected async replyUserNotFound(interaction: ChatInputCommandInteraction) {
    const content = 'Channel not found'
    await interaction.editReply(content)
  }
}

/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { bold, ChannelType, ChatInputCommandInteraction, inlineCode, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { TrackListService } from '../../../track/services/track-list.service'
import { TrackListItem } from '../../interfaces/track.interface'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class TrackListCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: TrackListCommand.name })

  public static readonly command = new SlashCommandBuilder()
    .setName('track_list')
    .setDescription('Show channel tracking')
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('By channel')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText))
    .addStringOption((option) => option
      .setName('channel_id')
      .setDescription('By channel id')
      .setRequired(false))

  constructor(
    @Inject(TrackListService)
    private trackListService: TrackListService,
  ) {
    super()
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    let channel: TextChannel

    try {
      channel = await this.getTextChannel(interaction)
    } catch (error) {
      await interaction.editReply(error.message)
      return
    }

    if (!channel) {
      await interaction.editReply('Channel not found')
      return
    }

    const canView = interaction.user.id === interaction.client.application.owner?.id
      || channel.permissionsFor(interaction.user).has(PermissionFlagsBits.ViewChannel)
    if (!canView) {
      await this.replyMissingPermission(interaction, 'VIEW_CHANNEL')
      return
    }

    const tracks = await this.trackListService.getManyByDiscordChannelId(channel.id)
    const reply = await interaction.editReply(`▶️ ${bold(String(tracks.length))} ◀️`)
    const payloads = this.getPayloads(tracks)

    await Promise.all(payloads.map((v) => reply.reply({
      embeds: [{
        description: v,
        color: 0x3ba55c,
      }],
    })))
  }

  private async getTextChannel(interaction: ChatInputCommandInteraction): Promise<TextChannel> {
    const channelId = interaction.options.getString('channel_id', false)
    if (channelId) {
      const channel = await interaction.client.channels.fetch(channelId, { allowUnknownGuild: true })
      if (!channel.isTextBased()) {
        return null
      }
      return channel as TextChannel
    }
    const channel = interaction.options.getChannel('channel', false) as TextChannel
    return channel || interaction.channel as TextChannel
  }

  private getPayloads(tracks: TrackListItem[]) {
    const payloads: string[] = []

    while (tracks.length) {
      const track = tracks.shift()
      const curPayload = payloads.pop()
      const newPayload = [
        inlineCode(track.type),
        `▶️ ${inlineCode(track.username)}`,
        track.filterUsername
          ? `⏩ ${inlineCode(track.filterUsername)}`
          : '',
        track.filterKeywords?.length
          ? `🗒️ ${inlineCode(track.filterKeywords.join(','))}`
          : '',
      ].map((v) => v.trim()).join(' ')

      if (!curPayload) {
        payloads.push(newPayload)
      } else if (curPayload.length + newPayload.length + 1 < 2000) {
        payloads.push([curPayload, newPayload].join('\n'))
      } else {
        payloads.push(curPayload, newPayload)
      }
    }

    return payloads
  }
}

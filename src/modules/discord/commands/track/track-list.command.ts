import { Inject, Injectable } from '@nestjs/common'
import {
  bold,
  CommandInteraction,
  inlineCode,
  SlashCommandBuilder,
} from 'discord.js'
import { baseLogger } from '../../../../logger'
import { TrackListService } from '../../../track/services/track-list.service'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class TrackListCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: TrackListCommand.name })

  public static readonly command = new SlashCommandBuilder()
    .setName('track_list')
    .setDescription('Show current channel tracking')

  constructor(
    @Inject(TrackListService)
    private trackListService: TrackListService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const tracks = await this.trackListService.getManyByDiscordChannelId(interaction.channelId)
    const msg = await interaction.editReply(`⏭️ ${bold(String(tracks.length))} ⏮️`)
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

    await Promise.all(payloads.map((v) => msg.reply({
      embeds: [{
        description: v,
        color: 0x3ba55c,
      }],
    })))
  }
}

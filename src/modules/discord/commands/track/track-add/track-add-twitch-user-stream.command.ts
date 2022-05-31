import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchStreamService } from '../../../../track/services/track-twitch-stream.service'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { BaseCommand } from '../../base/base.command'

@Injectable()
export class TrackAddTwitchUserStreamCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackAddTwitchUserStreamCommand.name })

  constructor(
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
    @Inject(TrackTwitchStreamService)
    private readonly trackTwitchStreamService: TrackTwitchStreamService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitchUserControllerService.fetchUserByUsername(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }
      await this.trackTwitchStreamService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('execute: added', meta)
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitchUtils.getUserUrl(user.username)})**`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }
}

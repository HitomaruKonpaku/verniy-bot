import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchStreamService } from '../../../../track/services/track-twitch-stream.service'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackRemoveBaseCommand } from './track-remove-base.command'

@Injectable()
export class TrackRemoveTwitchUserStreamCommand extends TrackRemoveBaseCommand {
  private readonly logger = baseLogger.child({ context: TrackRemoveTwitchUserStreamCommand.name })

  constructor(
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TrackTwitchStreamService)
    private readonly trackTwitchStreamService: TrackTwitchStreamService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitchUserService.getOneByUsername(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }

      await this.trackTwitchStreamService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitchUtils.getUserUrl(user.username)})**`,
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

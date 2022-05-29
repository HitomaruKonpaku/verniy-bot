import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitCastingLiveService } from '../../../../track/services/track-twitcasting-live.service'
import { TwitCastingUserService } from '../../../../twitcasting/services/data/twitcasting-user.service'
import { TwitCastingUtils } from '../../../../twitcasting/utils/twitcasting.utils'
import { TrackRemoveBaseCommand } from './track-remove-base.command'

@Injectable()
export class TrackRemoveTwitCastingLiveCommand extends TrackRemoveBaseCommand {
  private readonly logger = baseLogger.child({ context: TrackRemoveTwitCastingLiveCommand.name })

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TrackTwitCastingLiveService)
    private readonly trackTwitCastingLiveService: TrackTwitCastingLiveService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitCastingUserService.getOneByIdOrScreenId(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }

      await this.trackTwitCastingLiveService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})** TwitCasting user`,
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

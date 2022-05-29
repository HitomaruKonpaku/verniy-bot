import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterSpaceService } from '../../../../track/services/track-twitter-space.service'
import { TwitterUserService } from '../../../../twitter/services/data/twitter-user.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { TrackRemoveBaseCommand } from './track-remove-base.command'

@Injectable()
export class TrackRemoveTwitterSpaceCommand extends TrackRemoveBaseCommand {
  private readonly logger = baseLogger.child({ context: TrackRemoveTwitterSpaceCommand.name })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitterUserService.getOneByUsername(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }

      await this.trackTwitterSpaceService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Spaces`,
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

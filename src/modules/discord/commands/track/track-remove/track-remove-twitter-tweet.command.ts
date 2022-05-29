import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterTweetService } from '../../../../track/services/track-twitter-tweet.service'
import { TwitterUserService } from '../../../../twitter/services/data/twitter-user.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { TrackRemoveBaseCommand } from './track-remove-base.command'

@Injectable()
export class TrackRemoveTwitterTweetCommand extends TrackRemoveBaseCommand {
  private readonly logger = baseLogger.child({ context: TrackRemoveTwitterTweetCommand.name })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
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

      await this.trackTwitterTweetService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`,
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

import { bold, inlineCode } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction, User } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterTweetService } from '../../../../track/services/track-twitter-tweet.service'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../../../../twitter/services/data/twitter-filtered-stream-user.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { BaseCommand } from '../../base/base.command'

@Injectable()
export class TrackAddTwitterTweetCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackAddTwitterTweetCommand.name })

  constructor(
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
    const username = interaction.options.getString('username', true)
    const allowReply = interaction.options.getBoolean('allow_reply') ?? true
    const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitterUserControllerService.getOneByUsername(username)
      if (!await this.twitterFilteredStreamUserService.getOneById(user.id)) {
        const owner = interaction.client.application.owner as User
        const content = `> Due to Twitter API limitation, please contact ${bold(inlineCode(owner.tag))} to request to add this user to tracking list`
        interaction.editReply(content)
        this.logger.warn('<-- executeTweetCommand#ignore', { username, channelId })
        return
      }
      await this.trackTwitterTweetService.add(
        user.id,
        channelId,
        message,
        allowReply,
        allowRetweet,
        null,
        interaction.user.id,
      )
      this.logger.warn('execute: added', meta)
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`,
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

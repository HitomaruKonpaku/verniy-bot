import { bold, inlineCode } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction, MessageEmbedOptions, User } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterTweetService } from '../../../../track/services/track-twitter-tweet.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../../../../twitter/services/data/twitter-filtered-stream-user.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitterTweetCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitterTweetCommand.name })

  constructor(
    @Inject(TrackTwitterTweetService)
    protected readonly trackService: TrackTwitterTweetService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`
  }

  public async execute(interaction: CommandInteraction) {
    const { username, channelId, message } = this.getInteractionBaseOptions(interaction)
    const allowReply = interaction.options.getBoolean('allow_reply') ?? true
    const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitterUserControllerService.getOneByUsername(username)
      if (!user) {
        this.logger.warn('execute: user not found', meta)
        this.replyUserNotFound(interaction)
        return
      }

      if (!await this.twitterFilteredStreamUserService.getOneById(user.id)) {
        const owner = interaction.client.application.owner as User
        const content = `> Due to Twitter API limitation, please contact ${bold(inlineCode(owner.tag))} to request to add this user to tracking list`
        interaction.editReply(content)
        this.logger.warn('<-- executeTweetCommand#ignore', { username, channelId })
        return
      }

      await this.trackService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
        {
          allowReply,
          allowRetweet,
        },
      )
      this.logger.warn('execute: added', meta)

      const embed: MessageEmbedOptions = {
        description: this.getSuccessEmbedDescription(user),
        color: this.getSuccessEmbedColor(user),
      }
      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }
}

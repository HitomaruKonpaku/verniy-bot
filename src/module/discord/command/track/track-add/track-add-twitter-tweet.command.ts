/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { bold, ChatInputCommandInteraction, inlineCode, SlashCommandSubcommandBuilder, User } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitterTweetService } from '../../../../track/service/track-twitter-tweet.service'
import { TwitterUser } from '../../../../twitter/model/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/service/controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../../../../twitter/service/data/twitter-filtered-stream-user.service'
import { TwitterUserUtil } from '../../../../twitter/util/twitter-user.util'
import { TwitterUtil } from '../../../../twitter/util/twitter.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
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

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITTER_TWEET)
      .setDescription('Track user tweets')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
      .addBooleanOption((option) => option
        .setName('allow_reply')
        .setDescription('Allow reply?'))
      .addBooleanOption((option) => option
        .setName('allow_retweet')
        .setDescription('Allow retweet?'))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getOneByUsername(TwitterUserUtil.parseUsername(username))
    return user
  }

  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtil.getUserUrl(user.username)})** tweets`
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const { username, channelId, message } = this.getInteractionBaseOptions(interaction)
    const allowReply = interaction.options.getBoolean('allow_reply') ?? true
    const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
    const meta = {
      username,
      channelId,
      allowReply,
      allowRetweet,
    }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.getUser(username)
      if (!user) {
        this.logger.warn('execute: user not found', meta)
        await this.replyUserNotFound(interaction)
        return
      }

      // Only track user tweets from this table
      if (!await this.twitterFilteredStreamUserService.getOneById(user.id)) {
        if (!await this.isAppOwner(interaction)) {
          const owner = interaction.client.application.owner as User
          const content = `> Due to Twitter API limitation, please contact ${bold(inlineCode(owner.tag))} to request to add this user to tracking list`
          await interaction.editReply(content)
          this.logger.warn('<-- execute#ignore', { username, channelId })
          return
        }
        await this.twitterFilteredStreamUserService.add(user.id)
        this.logger.warn('execute#newFilteredStreamUser', { username })
      }

      await this.trackService.add(
        user.id,
        channelId,
        message,
        {
          updatedBy: interaction.user.id,
          allowReply,
          allowRetweet,
        },
      )
      this.logger.warn('execute: added', meta)

      await this.onSuccess(interaction, user)
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }
}

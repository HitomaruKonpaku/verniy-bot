import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitterProfileService } from '../../database/services/track-twitter-profile.service'
import { TrackTwitterTweetService } from '../../database/services/track-twitter-tweet.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { TwitterApiService } from '../../twitter/services/twitter-api.service'
import { TwitterUtils } from '../../twitter/utils/TwitterUtils'

@Injectable()
export class TrackCommand {
  private readonly logger = baseLogger.child({ context: TrackCommand.name })

  constructor(
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
  ) { }

  public static readonly command = new SlashCommandBuilder()
    .setName('track')
    .setDescription('Track Twitter user')
    .addSubcommand((subcommand) => subcommand
      .setName('tweet')
      .setDescription('Track user tweet')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message'))
      .addBooleanOption((option) => option
        .setName('allow_reply')
        .setDescription('Allow reply?'))
      .addBooleanOption((option) => option
        .setName('allow_retweet')
        .setDescription('Allow retweet?')))
    .addSubcommand((subcommand) => subcommand
      .setName('profile')
      .setDescription('Track user profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))

  public async execute(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case 'tweet':
        await this.executeTweetCommand(interaction)
        return
      case 'profile':
        await this.executeProfileCommand(interaction)
        return
      default:
        // eslint-disable-next-line no-debugger
        debugger
    }
  }

  private async executeTweetCommand(interaction: CommandInteraction) {
    try {
      const { channelId } = interaction
      const username = interaction.options.getString('username', true)
      const message = interaction.options.getString('message') || null
      const allowReply = interaction.options.getBoolean('allow_reply') ?? true
      const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
      let twitterUser = await this.twitterUserService.getOneByUsername(username)
      if (!twitterUser) {
        const user = await this.twitterApiService.getUserByUsername(username)
        twitterUser = await this.twitterUserService.updateByUserObject(user)
      }
      await this.trackTwitterTweetService.add(
        twitterUser.id,
        channelId,
        message,
        allowReply,
        allowRetweet,
        null,
        interaction.user.id,
      )
      this.logger.info('Tracking tweet', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${username}](${TwitterUtils.getUserUrl(username)})** tweet`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeTweetCommand: ${error.message}`)
      interaction.editReply(error.message)
    }
  }

  private async executeProfileCommand(interaction: CommandInteraction) {
    try {
      const { channelId } = interaction
      const username = interaction.options.getString('username', true)
      const message = interaction.options.getString('message') || null
      let twitterUser = await this.twitterUserService.getOneByUsername(username)
      if (!twitterUser) {
        const user = await this.twitterApiService.getUserByUsername(username)
        twitterUser = await this.twitterUserService.updateByUserObject(user)
      }
      await this.trackTwitterProfileService.add(
        twitterUser.id,
        channelId, message,
        interaction.user.id,
      )
      this.logger.info('Tracking profile', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${username}](${TwitterUtils.getUserUrl(username)})** profile`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeProfileCommand: ${error.message}`)
      interaction.editReply(error.message)
    }
  }
}

import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TwitterDiscordProfileService } from '../../database/services/twitter-discord-profile.service'
import { TwitterDiscordTweetService } from '../../database/services/twitter-discord-tweet.service'
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
    @Inject(TwitterDiscordTweetService)
    private readonly twitterDiscordTweetService: TwitterDiscordTweetService,
    @Inject(TwitterDiscordProfileService)
    private readonly twitterDiscordProfileService: TwitterDiscordProfileService,
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
        .setRequired(true)))

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
      const allowReply = interaction.options.getBoolean('allow_reply') ?? true
      const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
      const twitterUser = await this.twitterUserService.getOneByUsername(username)
      if (!twitterUser) {
        const user = await this.twitterApiService.getUserByUsername(username)
        await this.twitterUserService.updateByTwitterUser(user)
      }
      await this.twitterDiscordTweetService.add(username, channelId, allowReply, allowRetweet)
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
      const twitterUser = await this.twitterUserService.getOneByUsername(username)
      if (!twitterUser) {
        const user = await this.twitterApiService.getUserByUsername(username)
        await this.twitterUserService.updateByTwitterUser(user)
      }
      await this.twitterDiscordProfileService.add(username, channelId)
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

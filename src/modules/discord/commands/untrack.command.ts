import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitterProfileService } from '../../database/services/track-twitter-profile.service'
import { TrackTwitterTweetService } from '../../database/services/track-twitter-tweet.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { TwitterUtils } from '../../twitter/utils/TwitterUtils'

@Injectable()
export class UntrackCommand {
  private readonly logger = baseLogger.child({ context: UntrackCommand.name })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
  ) { }

  public static readonly command = new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Untrack Twitter user')
    .addSubcommand((subcommand) => subcommand
      .setName('tweet')
      .setDescription('Untrack user tweet')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('profile')
      .setDescription('Untrack user profile')
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
      const twitterUser = await this.twitterUserService.getOneByUsername(username)
      if (!twitterUser) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterTweetService.remove(twitterUser.id, channelId)
      this.logger.info('Untrack tweet', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${username}](${TwitterUtils.getUserUrl(username)})** tweet`,
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
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterProfileService.remove(twitterUser.id, channelId)
      this.logger.info('Untrack profile', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${username}](${TwitterUtils.getUserUrl(username)})** profile`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeProfileCommand: ${error.message}`)
      interaction.editReply(error.message)
    }
  }
}

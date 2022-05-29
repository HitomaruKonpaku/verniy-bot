import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseCommand } from '../../base/base.command'
import { TrackAddTwitCastingLiveCommand } from './track-add-twitcasting-live.command'
import { TrackAddTwitchUserStreamCommand } from './track-add-twitch-user-stream.command'
import { TrackAddTwitterProfileCommand } from './track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from './track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from './track-add-twitter-tweet.command'

@Injectable()
export class TrackAddCommand extends BaseCommand {
  public static readonly command = new SlashCommandBuilder()
    .setName('track_add')
    .setDescription('Add tracking')
    // twitter_tweet
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_tweet')
      .setDescription('Track user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true))
      .addStringOption((option) => option.setName('message').setDescription('Discord message'))
      .addBooleanOption((option) => option
        .setName('allow_reply')
        .setDescription('Allow reply?'))
      .addBooleanOption((option) => option
        .setName('allow_retweet')
        .setDescription('Allow retweet?')))
    // twitter_profile
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_profile')
      .setDescription('Track user profile changes')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true))
      .addStringOption((option) => option.setName('message').setDescription('Discord message')))
    // twitter_space
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_space')
      .setDescription('Track Spaces from user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true))
      .addStringOption((option) => option.setName('message').setDescription('Discord message')))
    // twitcasting_live
    .addSubcommand((subcommand) => subcommand
      .setName('twitcasting_live')
      .setDescription('Track user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TwitCasting user, e.g. "nakiriayame"')
        .setRequired(true))
      .addStringOption((option) => option.setName('message').setDescription('Discord message')))
    // twitch_user_stream
    .addSubcommand((subcommand) => subcommand
      .setName('twitch_user_stream')
      .setDescription('Track user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitch user, e.g. "nakiriayame_hololive"')
        .setRequired(true))
      .addStringOption((option) => option.setName('message').setDescription('Discord message')))

  private readonly logger = baseLogger.child({ context: TrackAddCommand.name })

  constructor(
    @Inject(ModuleRef)
    private moduleRef: ModuleRef,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    if (interaction.guild) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await this.replyMissingPermission(interaction, 'MANAGE_MESSAGES')
        return
      }
    }

    const subcommand = interaction.options.getSubcommand()
    const instance = this.moduleRef.get(this.getCommandService(subcommand))
    await instance?.execute?.(interaction)
  }

  private getCommandService(subcommand: string) {
    this.logger.debug(`getCommandService: ${subcommand}`)
    switch (subcommand) {
      case 'twitter_tweet':
        return TrackAddTwitterTweetCommand
      case 'twitter_profile':
        return TrackAddTwitterProfileCommand
      case 'twitter_space':
        return TrackAddTwitterSpaceCommand
      case 'twitcasting_live':
        return TrackAddTwitCastingLiveCommand
      case 'twitch_user_stream':
        return TrackAddTwitchUserStreamCommand
      default:
        return null
    }
  }
}

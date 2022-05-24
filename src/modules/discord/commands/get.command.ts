import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingMovieService } from '../../twitcasting/services/twitcasting-movie.service'
import { TwitCastingUserService } from '../../twitcasting/services/twitcasting-user.service'
import { TwitterApiPublicService } from '../../twitter/services/twitter-api-public.service'
import { TwitterApiService } from '../../twitter/services/twitter-api.service'
import { TwitterSpaceService } from '../../twitter/services/twitter-space.service'
import { TwitterUserService } from '../../twitter/services/twitter-user.service'
import { TwitterEntityUtils } from '../../twitter/utils/twitter-entity.utils'
import { BaseCommand } from './base/base.command'

@Injectable()
export class GetCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: GetCommand.name })

  constructor(
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterApiPublicService)
    private readonly twitterApiPublicService: TwitterApiPublicService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Get')
    .addSubcommandGroup((group) => group
      .setName('twitter')
      .setDescription('Twitter')
      .addSubcommand((subcommand) => subcommand
        .setName('user')
        .setDescription('User')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id'))
        .addStringOption((option) => option
          .setName('username')
          .setDescription('Username'))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('space')
        .setDescription('Space')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?'))))
    .addSubcommandGroup((group) => group
      .setName('twitcasting')
      .setDescription('TwitCasting')
      .addSubcommand((subcommand) => subcommand
        .setName('user')
        .setDescription('User')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('movie')
        .setDescription('Movie')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('movies_by_user')
        .setDescription('Movies by user')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))))

  public async execute(interaction: CommandInteraction) {
    try {
      const group = interaction.options.getSubcommandGroup()
      switch (group) {
        case 'twitter':
          this.logger.debug('--> executeTwitterGroup')
          await this.executeTwitterGroup(interaction)
          this.logger.debug('<-- executeTwitterGroup')
          return
        case 'twitcasting':
          this.logger.debug('--> executeTwitCastingGroup')
          await this.executeTwitCastingGroup(interaction)
          this.logger.debug('<-- executeTwitCastingGroup')
          return
        default:
          this.logger.warn(`execute: Unhandled command group: ${group}`, { group })
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
      await interaction.editReply(error.message)
    }
  }

  private async executeTwitterGroup(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case 'user':
        this.logger.debug('--> executeTwitterUserCommand')
        await this.executeTwitterUserCommand(interaction)
        this.logger.debug('<-- executeTwitterUserCommand')
        return
      case 'space':
        this.logger.debug('--> executeTwitterSpaceCommand')
        await this.executeTwitterSpaceCommand(interaction)
        this.logger.debug('<-- executeTwitterSpaceCommand')
        return
      default:
        this.logger.warn(`executeTwitterGroup: Unhandled subcommand: ${subcommand}`, { subcommand })
    }
  }

  private async executeTwitterUserCommand(interaction: CommandInteraction) {
    const id = interaction.options.getString('id')
    const username = interaction.options.getString('username')
    const refresh = interaction.options.getBoolean('refresh')
    if (!id && !username) {
      await interaction.editReply(`Required ${bold(inlineCode('id'))} or ${bold(inlineCode('username'))}`)
      return
    }
    let rawUser = id
      ? await this.twitterUserService.getRawOneById(id)
      : await this.twitterUserService.getRawOneByUsername(username)
    if (!rawUser || refresh) {
      const user = id
        ? await this.twitterApiService.getUserById(id)
        : await this.twitterApiService.getUserByUsername(username)
      await this.twitterUserService.updateByUserObject(user)
      rawUser = await this.twitterUserService.getRawOneById(user.id_str)
    }
    await this.replyObject(interaction, rawUser)
  }

  private async executeTwitterSpaceCommand(interaction: CommandInteraction) {
    const id = interaction.options.getString('id', true)
    const refresh = interaction.options.getBoolean('refresh')
    let rawSpace = await this.twitterSpaceService.getRawOneById(id)
    if (!rawSpace || refresh) {
      const result = await this.twitterApiService.getSpaceById(id)
      const space = result?.data
      if (!space) {
        await interaction.editReply(result.errors.map((v) => v.detail).join(' '))
        return
      }
      const twitterSpace = TwitterEntityUtils.buildSpace(space)
      if (twitterSpace.state === 'live') {
        try {
          twitterSpace.playlistUrl = await this.twitterApiPublicService.getSpacePlaylistUrl(id)
          twitterSpace.playlistActive = true
        } catch (error) {
          this.logger.error(`executeTwitterSpaceCommand#getSpacePlaylistUrl: $${error.message}`, { id })
        }
      }
      await this.twitterSpaceService.update(twitterSpace)
      try {
        const twitterUser = await this.twitterUserService.getOneById(twitterSpace.creatorId)
        if (!twitterUser) {
          const user = await this.twitterApiService.getUserById(twitterSpace.creatorId)
          await this.twitterUserService.updateByUserObject(user)
        }
      } catch (error) {
        this.logger.error(`executeTwitterSpaceCommand#updateUser: $${error.message}`, { id, userId: twitterSpace.creatorId })
      }
      rawSpace = await this.twitterSpaceService.getRawOneById(id)
    }
    await this.replyObject(interaction, rawSpace)
  }

  private async executeTwitCastingGroup(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case 'user':
        this.logger.debug('--> executeTwitCastingUserCommand')
        await this.executeTwitCastingUserCommand(interaction)
        this.logger.debug('<-- executeTwitCastingUserCommand')
        return
      case 'movie':
        this.logger.debug('--> executeTwitCastingMovieCommand')
        await this.executeTwitCastingMovieCommand(interaction)
        this.logger.debug('<-- executeTwitCastingMovieCommand')
        return
      case 'movies_by_user':
        this.logger.debug('--> executeTwitCastingMoviesByUserCommand')
        await this.executeTwitCastingMoviesByUserCommand(interaction)
        this.logger.debug('<-- executeTwitCastingMoviesByUserCommand')
        return
      default:
        this.logger.warn(`executeTwitCastingGroup: Unhandled subcommand: ${subcommand}`, { subcommand })
    }
  }

  private async executeTwitCastingUserCommand(interaction: CommandInteraction) {
    const id = interaction.options.getString('id', true)
    let user = await this.twitCastingUserService.getOneByIdOrScreenId(id)
    if (!user) {
      user = await this.twitCastingUserService.getOneAndSaveById(id)
    }
    await this.replyObject(interaction, user)
  }

  private async executeTwitCastingMovieCommand(interaction: CommandInteraction) {
    const id = interaction.options.getString('id', true)
    let movie = await this.twitCastingMovieService.getOneById(id)
    if (!movie) {
      movie = await this.twitCastingMovieService.getOneAndSaveById(id)
    }
    await this.replyObject(interaction, movie)
  }

  private async executeTwitCastingMoviesByUserCommand(interaction: CommandInteraction) {
    if (!await this.isAppOwner(interaction)) {
      await this.replyOwnerOnly(interaction)
      return
    }
    const id = interaction.options.getString('id', true)
    await this.twitCastingUserService.getOneAndSaveById(id)
    await this.twitCastingMovieService.fetchMoviesByUserIds(id)
    await interaction.editReply('✅')
  }
}

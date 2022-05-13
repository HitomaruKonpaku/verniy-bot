import { codeBlock, SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TwitterSpaceService } from '../../database/services/twitter-space.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { TwitterApiService } from '../../twitter/services/twitter-api.service'

@Injectable()
export class GetCommand {
  private readonly logger = baseLogger.child({ context: GetCommand.name })

  constructor(
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
  ) { }

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
          .setName('username')
          .setDescription('Username')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('space')
        .setDescription('Space')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))))

  public async execute(interaction: CommandInteraction) {
    try {
      const group = interaction.options.getSubcommandGroup()
      switch (group) {
        case 'twitter':
          await this.executeTwitterGroup(interaction)
          return
        default:
          // eslint-disable-next-line no-debugger
          debugger
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
        await this.executeTwitterUserCommand(interaction)
        return
      case 'space':
        await this.executeTwitterSpaceCommand(interaction)
        return
      default:
        // eslint-disable-next-line no-debugger
        debugger
    }
  }

  private async executeTwitterUserCommand(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true)
    const refresh = interaction.options.getBoolean('refresh')
    let twitterUser = await this.twitterUserService.getOneByUsername(username)
    if (!twitterUser || refresh) {
      const user = await this.twitterApiService.getUserByUsername(username)
      twitterUser = await this.twitterUserService.updateByUserObject(user)
    }
    await this.replyData(interaction, twitterUser)
  }

  private async executeTwitterSpaceCommand(interaction: CommandInteraction) {
    const id = interaction.options.getString('id', true)
    let twitterSpace = await this.twitterSpaceService.getOneById(id)
    if (!twitterSpace) {
      const result = await this.twitterApiService.getSpaceById(id)
      if (!result.data) {
        await interaction.editReply(result.errors.map((v) => v.detail).join(' '))
        return
      }
      twitterSpace = await this.twitterSpaceService.updateBySpaceObject(result.data)
    }
    await this.replyData(interaction, twitterSpace)
  }

  // eslint-disable-next-line class-methods-use-this
  private async replyData<T>(interaction: CommandInteraction, data: T) {
    await interaction.editReply({ content: codeBlock('json', JSON.stringify(data, null, 2)) })
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitchUserCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitchUserCommand.name })

  constructor(
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('user')
      .setDescription('User')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('username')
        .setRequired(true))
      .addBooleanOption((option) => option
        .setName('refresh')
        .setDescription('Refresh?'))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    // const id = interaction.options.getString('id', true)
    const refresh = interaction.options.getBoolean('refresh')
    const username = interaction.options.getString('username', true)
    let user = refresh
      ? null
      : await this.twitchUserService.getOneByUsername(username)

    if (!user) {
      user = await this.twitchUserControllerService.fetchUserByUsername(username)
    }

    await this.replyObject(interaction, user)
  }
}

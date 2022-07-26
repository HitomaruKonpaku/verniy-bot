import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingUserControllerService } from '../../../../twitcasting/services/controller/twitcasting-user-controller.service'
import { TwitCastingUserService } from '../../../../twitcasting/services/data/twitcasting-user.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitCastingUserCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingUserCommand.name })

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('user')
      .setDescription('User')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id')
        .setRequired(true))
      .addBooleanOption((option) => option
        .setName('refresh')
        .setDescription('Refresh?'))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id', true)
    const refresh = interaction.options.getBoolean('refresh')
    let user = refresh
      ? null
      : await this.twitCastingUserService.getOneByIdOrScreenId(id)

    if (!user) {
      user = await this.twitCastingUserControllerService.getOneAndSaveById(id)
    }

    await this.replyObject(interaction, user)
  }
}

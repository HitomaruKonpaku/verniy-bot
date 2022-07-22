import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingUserControllerService } from '../../../../twitcasting/services/controller/twitcasting-user-controller.service'
import { TwitCastingUserService } from '../../../../twitcasting/services/data/twitcasting-user.service'
import { GetBaseSubcommand } from '../base/get-base-subcommand'

@Injectable()
export class GetTwitCastingUserCommand extends GetBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingUserCommand.name })

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
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

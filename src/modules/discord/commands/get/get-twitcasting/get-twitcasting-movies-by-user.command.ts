import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingMovieControllerService } from '../../../../twitcasting/services/controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from '../../../../twitcasting/services/controller/twitcasting-user-controller.service'
import { GetBaseSubcommand } from '../base/get-base-subcommand'

@Injectable()
export class GetTwitCastingMoviesByUserCommand extends GetBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingMoviesByUserCommand.name })

  constructor(
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    await super.execute(interaction)

    if (!await this.isAppOwner(interaction)) {
      this.logger.warn('executeTwitCastingMoviesByUserCommand: blocked')
      await this.replyOwnerOnly(interaction)
      return
    }

    const id = interaction.options.getString('id', true)
    await this.twitCastingUserControllerService.getOneAndSaveById(id)
    const movies = await this.twitCastingMovieControllerService.getMoviesByUserIds(id)

    await interaction.editReply(`Found ${movies.length} movie(s)`)
  }
}

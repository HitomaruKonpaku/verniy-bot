import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingMovieControllerService } from '../../../../twitcasting/services/controller/twitcasting-movie-controller.service'
import { TwitCastingMovieService } from '../../../../twitcasting/services/data/twitcasting-movie.service'
import { GetBaseSubcommand } from '../base/get-base-subcommand'

@Injectable()
export class GetTwitCastingMovieCommand extends GetBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingMovieCommand.name })

  constructor(
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id', true)
    const refresh = interaction.options.getBoolean('refresh')
    let movie = refresh
      ? null
      : await this.twitCastingMovieService.getOneById(id)

    if (!movie) {
      movie = await this.twitCastingMovieControllerService.getOneAndSaveById(id)
    }

    await this.replyObject(interaction, movie)
  }
}

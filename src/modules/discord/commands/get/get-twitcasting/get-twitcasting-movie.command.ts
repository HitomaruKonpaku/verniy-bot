import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingMovieControllerService } from '../../../../twitcasting/services/controller/twitcasting-movie-controller.service'
import { TwitCastingMovieService } from '../../../../twitcasting/services/data/twitcasting-movie.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitCastingMovieCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingMovieCommand.name })

  constructor(
    @Inject(TwitCastingMovieService)
    private readonly twitCastingMovieService: TwitCastingMovieService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('movie')
      .setDescription('Movie')
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
    let movie = refresh
      ? null
      : await this.twitCastingMovieService.getOneById(id)

    if (!movie) {
      movie = await this.twitCastingMovieControllerService.getOneAndSaveById(id)
    }

    await this.replyObject(interaction, movie)
  }
}

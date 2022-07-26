import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitCastingMovieControllerService } from '../../../../twitcasting/services/controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from '../../../../twitcasting/services/controller/twitcasting-user-controller.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitCastingMoviesByUserCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingMoviesByUserCommand.name })

  constructor(
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TwitCastingMovieControllerService)
    private readonly twitCastingMovieControllerService: TwitCastingMovieControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('movies_by_user')
      .setDescription('Movies by user')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id')
        .setRequired(true))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
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

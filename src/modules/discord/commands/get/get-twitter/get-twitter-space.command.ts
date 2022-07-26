import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/services/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/services/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitterSpaceCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterSpaceCommand.name })

  constructor(
    @Inject(TwitterSpaceService)
    protected readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    protected readonly twitterSpaceControllerService: TwitterSpaceControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('space')
      .setDescription('Space')
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
    let rawSpace = refresh
      ? null
      : await this.twitterSpaceService.getRawOneById(id)

    if (!rawSpace) {
      await this.twitterSpaceControllerService.getOneById(id, refresh)
      rawSpace = await this.twitterSpaceService.getRawOneById(id)
    }

    await this.replyObject(interaction, rawSpace)
  }
}

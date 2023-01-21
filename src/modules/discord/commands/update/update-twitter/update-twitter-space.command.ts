import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/services/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/services/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateTwitterSpaceCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterSpaceCommand.name })

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
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const reqSpaces = await this.twitterSpaceService.repository.find({ where: { isActive: true } })
    if (!reqSpaces.length) {
      await interaction.editReply('Space(s) not found')
      return
    }

    const resSpaces = await this.twitterSpaceControllerService.getAllByIds(reqSpaces.map((v) => v.id))
    await interaction.editReply(`Updated ${resSpaces.length}/${reqSpaces.length} Spaces`)
  }
}

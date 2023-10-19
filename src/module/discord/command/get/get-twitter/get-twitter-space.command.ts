import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpace } from '../../../../twitter/model/twitter-space.entity'
import { TwitterSpaceControllerService } from '../../../../twitter/service/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/service/data/twitter-space.service'
import { TwitterSpaceUtil } from '../../../../twitter/util/twitter-space.util'
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
      .addStringOption((option) => option
        .setName('type')
        .setDescription('Type')
        .addChoices(
          { name: 'raw', value: 'raw' },
          { name: 'embed', value: 'embed' },
        ))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = TwitterSpaceUtil.parseId(interaction.options.getString('id', true))
    const refresh = interaction.options.getBoolean('refresh')
    const type = interaction.options.getString('type') || 'raw'

    let space: TwitterSpace = null
    if (!refresh) {
      space = await this.twitterSpaceService.getOneById(id, { withCreator: true })
    }

    if (!space) {
      await this.twitterSpaceControllerService.getOneById(id, { priority: 0 })
      space = await this.twitterSpaceService.getOneById(id, { withCreator: true })
    }

    if (!space) {
      await interaction.editReply('Space not found')
      return
    }

    if (type === 'embed') {
      const embed = TwitterSpaceUtil.getEmbed(space)
      await interaction.editReply({ embeds: [embed] })
      return
    }

    const rawSpace = await this.twitterSpaceService.getRawOneById(id)
    await this.replyObject(interaction, rawSpace)
  }
}

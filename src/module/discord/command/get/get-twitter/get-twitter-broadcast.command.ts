import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterBroadcastControllerService } from '../../../../twitter/service/controller/twitter-broardcast-controller.service'
import { TwitterBroadcastService } from '../../../../twitter/service/data/twitter-broadcast.service'
import { TwitterBroadcastUtil } from '../../../../twitter/util/twitter-broadcast.util'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitterBroadcastCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterBroadcastCommand.name })

  constructor(
    @Inject(TwitterBroadcastService)
    protected readonly twitterBroadcastService: TwitterBroadcastService,
    @Inject(TwitterBroadcastControllerService)
    protected readonly twitterBroadcastControllerService: TwitterBroadcastControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('broadcast')
      .setDescription('Broadcast')
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

    const id = TwitterBroadcastUtil.parseId(interaction.options.getString('id', true))
    const refresh = interaction.options.getBoolean('refresh')
    const type = interaction.options.getString('type') || 'raw'

    const broadcast = await this.twitterBroadcastControllerService.getOneById(id, { refresh })

    if (!broadcast) {
      await interaction.editReply('Broadcast not found')
      return
    }

    if (type === 'embed') {
      await this.replyObject(interaction, broadcast)
      return
    }

    const rawSpace = await this.twitterBroadcastService.getRawOneById(id)
    await this.replyObject(interaction, rawSpace)
  }
}

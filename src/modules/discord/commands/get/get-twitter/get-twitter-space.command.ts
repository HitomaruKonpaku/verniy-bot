import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/services/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/services/data/twitter-space.service'
import { GetBaseSubcommand } from '../base/get-base-subcommand'

@Injectable()
export class GetTwitterSpaceCommand extends GetBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterSpaceCommand.name })

  constructor(
    @Inject(TwitterSpaceService)
    protected readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    protected readonly twitterSpaceControllerService: TwitterSpaceControllerService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
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

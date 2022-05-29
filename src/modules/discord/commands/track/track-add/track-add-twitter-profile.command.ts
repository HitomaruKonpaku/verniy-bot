import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterProfileService } from '../../../../track/services/track-twitter-profile.service'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { BaseCommand } from '../../base/base.command'

@Injectable()
export class TrackAddTwitterProfileCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackAddTwitterProfileCommand.name })

  constructor(
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitterUserControllerService.getOneByUsername(username)
      await this.trackTwitterProfileService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('execute: added', meta)
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** profile`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }
}

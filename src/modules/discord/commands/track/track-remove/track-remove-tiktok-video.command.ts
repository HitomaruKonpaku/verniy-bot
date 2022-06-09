import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TiktokUserService } from '../../../../tiktok/services/data/tiktok-user.service'
import { TiktokUtils } from '../../../../tiktok/utils/tiktok.utils'
import { TrackTiktokVideoService } from '../../../../track/services/track-tiktok-video.service'
import { TrackRemoveBaseCommand } from './track-remove-base.command'

@Injectable()
export class TrackRemoveTiktokVideoCommand extends TrackRemoveBaseCommand {
  private readonly logger = baseLogger.child({ context: TrackRemoveTiktokVideoCommand.name })

  constructor(
    @Inject(TiktokUserService)
    private readonly tiktokUserService: TiktokUserService,
    @Inject(TrackTiktokVideoService)
    private readonly trackTiktokVideoService: TrackTiktokVideoService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.tiktokUserService.getOneById(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }

      await this.trackTiktokVideoService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('execute: removed', meta)

      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TiktokUtils.getUserUrl(user.username)})** TikTok`,
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

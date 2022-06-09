import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TrackTiktokVideoService } from '../../track/services/track-tiktok-video.service'
import { TiktokUser } from '../models/tiktok-user.entity'
import { TiktokUtils } from '../utils/tiktok.utils'
import { TiktokProxyService } from './api/tiktok-proxy.service'
import { TiktokUserControllerService } from './controller/tiktok-user-controller.service'

@Injectable()
export class TiktokTrackingService {
  private readonly logger = baseLogger.child({ context: TiktokTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTiktokVideoService)
    private readonly trackTiktokVideoService: TrackTiktokVideoService,
    @Inject(TiktokUserControllerService)
    private readonly tiktokUserControllerService: TiktokUserControllerService,
    @Inject(TiktokProxyService)
    private readonly tiktokProxyService: TiktokProxyService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.checkUsers()
  }

  private async checkUsers() {
    try {
      const usernames = await this.trackTiktokVideoService.getUsernamesForCheck()
      this.logger.debug('checkUsers', { userCount: usernames.length })
      await Promise.all(usernames.map((v) => this.checkUser(v)))
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const { interval } = this.configService.tiktok.track
    setTimeout(() => this.checkUsers(), interval)
  }

  private async checkUser(username: string) {
    try {
      const user = await this.tiktokUserControllerService.fetchUser(username)
      if (user?.newVideos?.length) {
        await this.notifyUserNewVideos(user)
      }
    } catch (error) {
      this.logger.error(`checkUser: ${error.message}`, { username })
    }
  }

  private async notifyUserNewVideos(user: TiktokUser) {
    try {
      const trackItems = await this.getTrackItems(user)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        user.newVideos.forEach(async (video) => {
          try {
            const content = [trackItem.discordMessage]
              .filter((v) => v)
              .join('\n') || null
            const embed = TiktokUtils.getVideoEmbed(video, user, this.tiktokProxyService.getProxyUrl())
            const fileUrl = TiktokUtils.getVideoAttachmentUrl(user.username, video.id, this.tiktokProxyService.getProxyUrl())
            const message = await this.discordService.sendToChannel(
              trackItem.discordChannelId,
              { content, embeds: [embed] },
            )
            await message
              .reply({ files: [{ attachment: fileUrl, name: `${video.id}.mp4` }] })
              .catch((error) => message.reply(`Unable to send video: ${error.message}`))
          } catch (error) {
            this.logger.error(`notifyUserNewVideos#send: ${error.message}`, {
              user: { id: user.id, username: user.username },
              video: { id: video.id },
            })
          }
        })
      })
    } catch (error) {
      this.logger.error(`notifyUserNewVideos: ${error.message}`, { user })
    }
  }

  private async getTrackItems(user: TiktokUser) {
    try {
      const items = await this.trackTiktokVideoService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user: { id: user.id } })
    }
    return []
  }
}

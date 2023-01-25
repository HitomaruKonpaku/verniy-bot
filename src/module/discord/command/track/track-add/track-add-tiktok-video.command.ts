/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TiktokUser } from '../../../../tiktok/model/tiktok-user.entity'
import { TiktokUserControllerService } from '../../../../tiktok/service/controller/tiktok-user-controller.service'
import { TiktokUserService } from '../../../../tiktok/service/data/tiktok-user.service'
import { TiktokUtil } from '../../../../tiktok/util/tiktok.util'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTiktokVideoService } from '../../../../track/service/track-tiktok-video.service'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTiktokVideoCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTiktokVideoCommand.name })

  constructor(
    @Inject(TrackTiktokVideoService)
    protected readonly trackService: TrackTiktokVideoService,
    @Inject(TiktokUserService)
    private readonly tiktokUserService: TiktokUserService,
    @Inject(TiktokUserControllerService)
    private readonly tiktokUserControllerService: TiktokUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TIKTOK_VIDEO)
      .setDescription('Track user videos')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'TikTok user, e.g. "hololive_english"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TiktokUser> {
    let user = await this.tiktokUserService.getOneByUsername(username)
    if (!user) {
      user = await this.tiktokUserControllerService.fetchUser(username)
    }
    return user
  }

  protected getSuccessEmbedDescription(user: TiktokUser): string {
    return `Tracking **[${user.username}](${TiktokUtil.getUserUrl(user.username)})** TikTok`
  }
}

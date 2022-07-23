/* eslint-disable class-methods-use-this */
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TiktokUser } from '../../../../tiktok/models/tiktok-user.entity'
import { TiktokUserControllerService } from '../../../../tiktok/services/controller/tiktok-user-controller.service'
import { TiktokUserService } from '../../../../tiktok/services/data/tiktok-user.service'
import { TiktokUtils } from '../../../../tiktok/utils/tiktok.utils'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTiktokVideoService } from '../../../../track/services/track-tiktok-video.service'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'TikTok user, e.g. "hololive_english"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtils.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TiktokUser> {
    let user = await this.tiktokUserService.getOneByUsername(username)
    if (!user) {
      user = await this.tiktokUserControllerService.fetchUser(username)
    }
    return user
  }

  protected getSuccessEmbedDescription(user: TiktokUser): string {
    return `Tracking **[${user.username}](${TiktokUtils.getUserUrl(user.username)})** TikTok`
  }
}

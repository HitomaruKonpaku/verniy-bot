import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TiktokUser } from '../../../../tiktok/model/tiktok-user.entity'
import { TiktokUserService } from '../../../../tiktok/service/data/tiktok-user.service'
import { TiktokUtil } from '../../../../tiktok/util/tiktok.util'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTiktokVideoService } from '../../../../track/service/track-tiktok-video.service'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTiktokVideoCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTiktokVideoCommand.name })

  constructor(
    @Inject(TrackTiktokVideoService)
    protected readonly trackService: TrackTiktokVideoService,
    @Inject(TiktokUserService)
    private readonly tiktokUserService: TiktokUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TIKTOK_VIDEO)
      .setDescription('Untrack user videos')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'TikTok user, e.g. "hololive_english"' },
      ))
  }

  protected async getUser(username: string): Promise<TiktokUser> {
    const user = await this.tiktokUserService.getOneById(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TiktokUser): string {
    return `Untrack **[${user.username}](${TiktokUtil.getUserUrl(user.username)})** TikTok`
  }
}

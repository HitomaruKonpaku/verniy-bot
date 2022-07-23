import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TiktokUser } from '../../../../tiktok/models/tiktok-user.entity'
import { TiktokUserService } from '../../../../tiktok/services/data/tiktok-user.service'
import { TiktokUtils } from '../../../../tiktok/utils/tiktok.utils'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTiktokVideoService } from '../../../../track/services/track-tiktok-video.service'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
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
    return `Untrack **[${user.username}](${TiktokUtils.getUserUrl(user.username)})** TikTok`
  }
}

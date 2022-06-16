import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchLiveService } from '../../../../track/services/track-twitch-live.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitchLiveCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitchLiveCommand.name })

  constructor(
    @Inject(TrackTwitchLiveService)
    protected readonly trackService: TrackTwitchLiveService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Untrack **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch`
  }
}

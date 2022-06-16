import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchLiveService } from '../../../../track/services/track-twitch-live.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitchLiveCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitchLiveCommand.name })

  constructor(
    @Inject(TrackTwitchLiveService)
    protected readonly trackService: TrackTwitchLiveService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserControllerService.fetchUserByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Tracking **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch`
  }
}

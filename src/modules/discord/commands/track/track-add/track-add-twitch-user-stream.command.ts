import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchStreamService } from '../../../../track/services/track-twitch-stream.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitchUserStreamCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitchUserStreamCommand.name })

  constructor(
    @Inject(TrackTwitchStreamService)
    protected readonly trackService: TrackTwitchStreamService,
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

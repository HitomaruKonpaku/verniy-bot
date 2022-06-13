import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchStreamService } from '../../../../track/services/track-twitch-stream.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitchUserStreamCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitchUserStreamCommand.name })

  constructor(
    @Inject(TrackTwitchStreamService)
    protected readonly trackService: TrackTwitchStreamService,
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

/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitchChatService } from '../../../../track/services/track-twitch-chat.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchChatTrackingService } from '../../../../twitch/services/tracking/twitch-chat-tracking.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitchChatCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitchChatCommand.name })

  constructor(
    @Inject(TrackTwitchChatService)
    protected readonly trackService: TrackTwitchChatService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
    @Inject(TwitchChatTrackingService)
    private readonly twitchChatTrackingService: TwitchChatTrackingService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserControllerService.fetchUserByUsername(username)
    return user
  }

  protected async onSuccess(interaction: CommandInteraction, user: TwitchUser) {
    await this.twitchChatTrackingService.joinChannel(user.username)
    await super.onSuccess(interaction, user)
  }

  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Tracking **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch chat`
  }
}

/* eslint-disable class-methods-use-this */
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitchLiveService } from '../../../../track/services/track-twitch-live.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCH_LIVE)
      .setDescription('Track user live')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitch user, e.g. "nakiriayame_hololive"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtils.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserControllerService.fetchUserByUsername(username)
    return user
  }

  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Tracking **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch live`
  }
}

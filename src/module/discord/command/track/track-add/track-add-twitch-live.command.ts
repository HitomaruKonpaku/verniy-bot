/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitchLiveService } from '../../../../track/service/track-twitch-live.service'
import { TwitchUser } from '../../../../twitch/model/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/service/controller/twitch-user-controller.service'
import { TwitchUtil } from '../../../../twitch/util/twitch.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
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
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'Twitch user, e.g. "nakiriayame_hololive"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserControllerService.fetchUserByUsername(username)
    return user
  }

  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Tracking **[${user.username}](${TwitchUtil.getUserUrl(user.username)})** Twitch live`
  }
}

/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitCastingLiveService } from '../../../../track/service/track-twitcasting-live.service'
import { TwitCastingUser } from '../../../../twitcasting/model/twitcasting-user.entity'
import { TwitCastingUserControllerService } from '../../../../twitcasting/service/controller/twitcasting-user-controller.service'
import { TwitCastingUtil } from '../../../../twitcasting/util/twitcasting.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitCastingLiveCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitCastingLiveCommand.name })

  constructor(
    @Inject(TrackTwitCastingLiveService)
    protected readonly trackService: TrackTwitCastingLiveService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCASTING_LIVE)
      .setDescription('Track user live')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'TwitCasting user, e.g. "nakiriayame"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TwitCastingUser> {
    const user = await this.twitCastingUserControllerService.getOneAndSaveById(username)
    return user
  }

  protected getSuccessEmbedDescription(user: TwitCastingUser): string {
    return `Tracking **[${user.screenId}](${TwitCastingUtil.getUserUrl(user.screenId)})** TwitCasting`
  }
}

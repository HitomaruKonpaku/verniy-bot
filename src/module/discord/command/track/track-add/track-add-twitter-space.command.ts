/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitterSpaceService } from '../../../../track/service/track-twitter-space.service'
import { TwitterUser } from '../../../../twitter/model/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/service/controller/twitter-user-controller.service'
import { TwitterUserUtil } from '../../../../twitter/util/twitter-user.util'
import { TwitterUtil } from '../../../../twitter/util/twitter.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitterSpaceCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitterSpaceCommand.name })

  constructor(
    @Inject(TrackTwitterSpaceService)
    protected readonly trackService: TrackTwitterSpaceService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITTER_SPACE)
      .setDescription('Track Spaces from user')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getUserByScreenName(TwitterUserUtil.parseUsername(username))
    return user
  }

  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtil.getUserUrl(user.username)})** Spaces`
  }
}

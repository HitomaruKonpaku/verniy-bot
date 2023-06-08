/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitterProfileService } from '../../../../track/service/track-twitter-profile.service'
import { TwitterUser } from '../../../../twitter/model/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/service/controller/twitter-user-controller.service'
import { TwitterUserUtil } from '../../../../twitter/util/twitter-user.util'
import { TwitterUtil } from '../../../../twitter/util/twitter.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitterProfileCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitterProfileCommand.name })

  constructor(
    @Inject(TrackTwitterProfileService)
    protected readonly trackService: TrackTwitterProfileService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITTER_PROFILE)
      .setDescription('Track user profile changes')
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
    return `Tracking **[${user.username}](${TwitterUtil.getUserUrl(user.username)})** Twitter profile`
  }
}

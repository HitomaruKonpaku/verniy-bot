/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitterSpaceService } from '../../../../track/services/track-twitter-space.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterUserUtils } from '../../../../twitter/utils/twitter-user.utils'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtils.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getOneByUsername(TwitterUserUtils.parseUsername(username))
    return user
  }

  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Spaces`
  }
}

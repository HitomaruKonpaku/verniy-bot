import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitterProfileService } from '../../../../track/service/track-twitter-profile.service'
import { TwitterUser } from '../../../../twitter/model/twitter-user.entity'
import { TwitterUserService } from '../../../../twitter/service/data/twitter-user.service'
import { TwitterUserUtil } from '../../../../twitter/util/twitter-user.util'
import { TwitterUtil } from '../../../../twitter/util/twitter.util'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitterProfileCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitterProfileCommand.name })

  constructor(
    @Inject(TrackTwitterProfileService)
    protected readonly trackService: TrackTwitterProfileService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITTER_PROFILE)
      .setDescription('Untrack user profile changes')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserService.getOneByUsername(TwitterUserUtil.parseUsername(username))
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Untrack **[${user.username}](${TwitterUtil.getUserUrl(user.username)})** Twitter profile`
  }
}

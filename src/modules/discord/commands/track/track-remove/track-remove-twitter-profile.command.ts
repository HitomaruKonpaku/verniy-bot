import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitterProfileService } from '../../../../track/services/track-twitter-profile.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserService } from '../../../../twitter/services/data/twitter-user.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Twitter profile`
  }
}

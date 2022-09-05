import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitterTweetService } from '../../../../track/services/track-twitter-tweet.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserService } from '../../../../twitter/services/data/twitter-user.service'
import { TwitterUserUtils } from '../../../../twitter/utils/twitter-user.utils'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitterTweetCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitterTweetCommand.name })

  constructor(
    @Inject(TrackTwitterTweetService)
    protected readonly trackService: TrackTwitterTweetService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITTER_TWEET)
      .setDescription('Untrack user tweets')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitter username, e.g. "nakiriayame"' },
      ))
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserService.getOneByUsername(TwitterUserUtils.parseUsername(username))
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`
  }
}

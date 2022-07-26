import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/models/instagram-user.entity'
import { InstagramUserService } from '../../../../instagram/services/data/instagram-user.service'
import { InstagramUtils } from '../../../../instagram/utils/instagram.utils'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackInstagramPostService } from '../../../../track/services/track-instagram-post.service'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveInstagramPostCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveInstagramPostCommand.name })

  constructor(
    @Inject(TrackInstagramPostService)
    protected readonly trackService: TrackInstagramPostService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.INSTAGRAM_POST)
      .setDescription('Untrack user posts')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Instagram user' },
      ))
  }

  protected async getUser(username: string): Promise<InstagramUser> {
    const user = await this.instagramUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: InstagramUser): string {
    return `Untrack **[${user.username}](${InstagramUtils.getUserUrl(user.username)})** Instagram posts`
  }
}

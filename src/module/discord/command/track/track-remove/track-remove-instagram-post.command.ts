import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/model/instagram-user.entity'
import { InstagramUserService } from '../../../../instagram/service/data/instagram-user.service'
import { InstagramUtil } from '../../../../instagram/util/instagram.util'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackInstagramPostService } from '../../../../track/service/track-instagram-post.service'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
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
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
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
    return `Untrack **[${user.username}](${InstagramUtil.getUserUrl(user.username)})** Instagram posts`
  }
}

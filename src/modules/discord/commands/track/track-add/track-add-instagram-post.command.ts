/* eslint-disable class-methods-use-this */
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/models/instagram-user.entity'
import { InstagramUserControllerService } from '../../../../instagram/services/controller/instagram-user-controller.service'
import { InstagramUserService } from '../../../../instagram/services/data/instagram-user.service'
import { InstagramUtils } from '../../../../instagram/utils/instagram.utils'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackInstagramPostService } from '../../../../track/services/track-instagram-post.service'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddInstagramPostCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddInstagramPostCommand.name })

  constructor(
    @Inject(TrackInstagramPostService)
    protected readonly trackService: TrackInstagramPostService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
    @Inject(InstagramUserControllerService)
    private readonly instagramUserControllerService: InstagramUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.INSTAGRAM_POST)
      .setDescription('Track user posts')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Instagram user' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtils.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<InstagramUser> {
    let user = await this.instagramUserService.getOneByUsername(username)
    if (!user) {
      user = await this.instagramUserControllerService.fetchUserByUsername(username)
    }
    return user
  }

  protected isUserTrackable(user: InstagramUser): boolean {
    return !user.isPrivate
  }

  protected getUntrackableMessage(): string {
    return 'Unable to track private user!'
  }

  protected getSuccessEmbedDescription(user: InstagramUser): string {
    return `Tracking **[${user.username}](${InstagramUtils.getUserUrl(user.username)})** Instagram posts`
  }
}

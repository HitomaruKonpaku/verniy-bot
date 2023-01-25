import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/model/instagram-user.entity'
import { InstagramUserService } from '../../../../instagram/service/data/instagram-user.service'
import { InstagramUtil } from '../../../../instagram/util/instagram.util'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackInstagramStoryService } from '../../../../track/service/track-instagram-story.service'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveInstagramStoryCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveInstagramStoryCommand.name })

  constructor(
    @Inject(TrackInstagramStoryService)
    protected readonly trackService: TrackInstagramStoryService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.INSTAGRAM_STORY)
      .setDescription('Untrack user stories')
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
    return `Untrack **[${user.username}](${InstagramUtil.getUserUrl(user.username)})** Instagram stories`
  }
}

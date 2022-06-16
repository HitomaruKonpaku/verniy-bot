import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/models/instagram-user.entity'
import { InstagramUserControllerService } from '../../../../instagram/services/controller/instagram-user-controller.service'
import { InstagramUserService } from '../../../../instagram/services/data/instagram-user.service'
import { InstagramUtils } from '../../../../instagram/utils/instagram.utils'
import { TrackInstagramStoryService } from '../../../../track/services/track-instagram-story.service'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddInstagramStoryCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddInstagramStoryCommand.name })

  constructor(
    @Inject(TrackInstagramStoryService)
    protected readonly trackService: TrackInstagramStoryService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
    @Inject(InstagramUserControllerService)
    private readonly instagramUserControllerService: InstagramUserControllerService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<InstagramUser> {
    let user = await this.instagramUserService.getOneByUsername(username)
    if (!user) {
      user = await this.instagramUserControllerService.fetchUserByUsername(username)
    }
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: InstagramUser): string {
    return `Tracking **[${user.username}](${InstagramUtils.getUserUrl(user.username)})** Instagram story`
  }

  public async execute(interaction: CommandInteraction) {
    if (!await this.isAppOwner(interaction)) {
      await this.replyOwnerOnly(interaction)
      return
    }
    super.execute(interaction)
  }
}

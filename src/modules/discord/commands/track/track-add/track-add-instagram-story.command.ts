/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/models/instagram-user.entity'
import { InstagramUserControllerService } from '../../../../instagram/services/controller/instagram-user-controller.service'
import { InstagramUserService } from '../../../../instagram/services/data/instagram-user.service'
import { InstagramUtils } from '../../../../instagram/utils/instagram.utils'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackInstagramStoryService } from '../../../../track/services/track-instagram-story.service'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
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

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.INSTAGRAM_STORY)
      .setDescription('Track user stories')
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
    return `Tracking **[${user.username}](${InstagramUtils.getUserUrl(user.username)})** Instagram stories`
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    if (!await this.isAppOwner(interaction)) {
      this.logger.warn('execute: blocked')
      await this.replyOwnerOnly(interaction)
      return
    }
    super.execute(interaction)
  }
}

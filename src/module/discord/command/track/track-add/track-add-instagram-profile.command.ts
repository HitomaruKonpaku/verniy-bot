/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/model/instagram-user.entity'
import { InstagramUserControllerService } from '../../../../instagram/service/controller/instagram-user-controller.service'
import { InstagramUserService } from '../../../../instagram/service/data/instagram-user.service'
import { InstagramUtil } from '../../../../instagram/util/instagram.util'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackInstagramProfileService } from '../../../../track/service/track-instagram-profile.service'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddInstagramProfileCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddInstagramProfileCommand.name })

  constructor(
    @Inject(TrackInstagramProfileService)
    protected readonly trackService: TrackInstagramProfileService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
    @Inject(InstagramUserControllerService)
    private readonly instagramUserControllerService: InstagramUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.INSTAGRAM_PROFILE)
      .setDescription('Track user profile')
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
        option,
        { description: 'Instagram user' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtil.getMessageOption(option))
  }

  protected async getUser(username: string): Promise<InstagramUser> {
    let user = await this.instagramUserService.getOneByUsername(username)
    if (!user) {
      user = await this.instagramUserControllerService.fetchUserByUsername(username)
    }
    return user
  }

  protected getSuccessEmbedDescription(user: InstagramUser): string {
    return `Tracking **[${user.username}](${InstagramUtil.getUserUrl(user.username)})** Instagram profile`
  }
}

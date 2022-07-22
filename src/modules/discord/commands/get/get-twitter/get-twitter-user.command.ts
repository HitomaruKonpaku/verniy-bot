import { bold, inlineCode } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterApiService } from '../../../../twitter/services/api/twitter-api.service'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterUserService } from '../../../../twitter/services/data/twitter-user.service'
import { GetBaseSubcommand } from '../base/get-base-subcommand'

@Injectable()
export class GetTwitterUserCommand extends GetBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterUserCommand.name })

  constructor(
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id')
    const refresh = interaction.options.getBoolean('refresh')
    const username = interaction.options.getString('username')

    if (!id && !username) {
      const content = `Required ${bold(inlineCode('id'))} or ${bold(inlineCode('username'))}`
      await interaction.editReply(content)
      return
    }

    // eslint-disable-next-line no-nested-ternary
    let rawUser = refresh
      ? null
      : id
        ? await this.twitterUserService.getRawOneById(id)
        : await this.twitterUserService.getRawOneByUsername(username)

    if (!rawUser) {
      const user = id
        ? await this.twitterApiService.getUserById(id)
        : await this.twitterApiService.getUserByUsername(username)
      await this.twitterUserControllerService.saveUser(user)
      rawUser = await this.twitterUserService.getRawOneById(user.id_str)
    }

    await this.replyObject(interaction, rawUser)
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, bold, inlineCode } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterUserControllerService } from '../../../../twitter/service/controller/twitter-user-controller.service'
import { TwitterUserService } from '../../../../twitter/service/data/twitter-user.service'
import { TwitterUserUtil } from '../../../../twitter/util/twitter-user.util'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitterUserCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterUserCommand.name })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('user')
      .setDescription('User')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id'))
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Username'))
      .addBooleanOption((option) => option
        .setName('refresh')
        .setDescription('Refresh?'))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id')
    const refresh = interaction.options.getBoolean('refresh')
    const username = TwitterUserUtil.parseUsername(interaction.options.getString('username'))

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
        ? await this.twitterUserControllerService.getUserByRestId(id)
        : await this.twitterUserControllerService.getUserByScreenName(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }
      rawUser = await this.twitterUserService.getRawOneById(user.id)
    }

    await this.replyObject(interaction, rawUser)
  }
}

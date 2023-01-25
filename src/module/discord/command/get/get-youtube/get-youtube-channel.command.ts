import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { YoutubeChannelControllerService } from '../../../../youtube/service/controller/youtube-channel-controller.service'
import { YoutubeChannelService } from '../../../../youtube/service/data/youtube-channel.service'
import { YoutubeChannelUtil } from '../../../../youtube/util/youtube-channel.util'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetYoutubeChannelCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetYoutubeChannelCommand.name })

  constructor(
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
    @Inject(YoutubeChannelControllerService)
    private readonly youtubeChannelControllerService: YoutubeChannelControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('channel')
      .setDescription('Channel')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('id')
        .setRequired(true))
      .addBooleanOption((option) => option
        .setName('refresh')
        .setDescription('Refresh?'))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = YoutubeChannelUtil.parseId(interaction.options.getString('id', true))
    const refresh = interaction.options.getBoolean('refresh')
      && await this.isAppOwner(interaction)
    let channel = refresh
      ? null
      : await this.youtubeChannelService.getOneById(id)

    if (!channel) {
      channel = await this.youtubeChannelControllerService.getOneById(id, refresh)
    }

    if (!channel) {
      await this.replyUserNotFound(interaction)
      return
    }

    await this.replyObject(interaction, channel)
  }

  // eslint-disable-next-line class-methods-use-this
  protected async replyUserNotFound(interaction: ChatInputCommandInteraction) {
    const content = 'Channel not found'
    await interaction.editReply(content)
  }
}

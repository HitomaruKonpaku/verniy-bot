import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceService } from '../../../../twitter/service/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateTwitterSpacePlaylistUrlCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterSpacePlaylistUrlCommand.name })

  constructor(
    @Inject(TwitterSpaceService)
    protected readonly twitterSpaceService: TwitterSpaceService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('space_playlist_url')
      .setDescription('Space playlist url')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('id')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('playlist_url')
        .setDescription('playlist_url')
        .setRequired(true))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id', true)
    const playlistUrl = interaction.options.getString('playlist_url', true)
    this.logger.warn('execute', { id, playlistUrl })

    const result = await this.twitterSpaceService.patchPlaylistUrl(id, playlistUrl)
    const affected = result.affected || 0
    this.logger.warn('execute', { id, affected })

    await interaction.editReply(`Updated: ${affected}`)
  }
}

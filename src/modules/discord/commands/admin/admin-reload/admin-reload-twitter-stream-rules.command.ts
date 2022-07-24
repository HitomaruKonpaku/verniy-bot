import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterTweetTrackingService } from '../../../../twitter/services/tracking/twitter-tweet-tracking.service'
import { AdminBaseSubcommand } from '../base/admin-base-subcommand'

@Injectable()
export class AdminReloadTwitterStreamRulesCommand extends AdminBaseSubcommand {
  protected readonly logger = baseLogger.child({ context: AdminReloadTwitterStreamRulesCommand.name })

  constructor(
    @Inject(TwitterTweetTrackingService)
    private readonly twitterTweetTrackingService: TwitterTweetTrackingService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('twitter_stream_rules')
      .setDescription('Reload Twitter stream rules')
  }

  public async execute(interaction: CommandInteraction) {
    await super.execute(interaction)

    await this.twitterTweetTrackingService.reloadStreamRules()

    await interaction.editReply('✅')
  }
}

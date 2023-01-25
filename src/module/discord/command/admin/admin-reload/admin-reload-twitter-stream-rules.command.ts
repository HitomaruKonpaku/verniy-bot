import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterTweetTrackingService } from '../../../../twitter/service/tracking/twitter-tweet-tracking.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class AdminReloadTwitterStreamRulesCommand extends BaseCommand {
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

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    await this.twitterTweetTrackingService.reloadStreamRules()

    await interaction.editReply('✅')
  }
}

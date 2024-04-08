import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, inlineCode } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpace } from '../../../../twitter/model/twitter-space.entity'
import { TwitterSpaceControllerService } from '../../../../twitter/service/controller/twitter-space-controller.service'
import { TwitterTweetControllerService } from '../../../../twitter/service/controller/twitter-tweet-controller.service'
import { TwitterSpaceService } from '../../../../twitter/service/data/twitter-space.service'
import { TwitterSpaceUtil } from '../../../../twitter/util/twitter-space.util'
import { TwitterTweetUtil } from '../../../../twitter/util/twitter-tweet.util'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class GetTwitterSpaceCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterSpaceCommand.name })

  constructor(
    @Inject(TwitterSpaceService)
    protected readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    protected readonly twitterSpaceControllerService: TwitterSpaceControllerService,
    @Inject(TwitterTweetControllerService)
    protected readonly twitterTweetControllerService: TwitterTweetControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('space')
      .setDescription('Space')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id'))
      .addStringOption((option) => option
        .setName('tweet_id')
        .setDescription('Tweet id or url'))
      .addBooleanOption((option) => option
        .setName('refresh')
        .setDescription('Refresh?'))
      .addStringOption((option) => option
        .setName('type')
        .setDescription('Type')
        .addChoices(
          { name: 'raw', value: 'raw' },
          { name: 'embed', value: 'embed' },
        ))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    let id = TwitterSpaceUtil.parseId(interaction.options.getString('id'))
    if (!id) {
      const tweetId = TwitterTweetUtil.parseId(interaction.options.getString('tweet_id'))
      if (tweetId) {
        const tweet = await this.twitterTweetControllerService.getByTweetDetail(tweetId)
        id = tweet.spaceIds?.[0]
      }
    }

    if (!id) {
      await interaction.editReply('Id not found')
      return
    }

    const refresh = interaction.options.getBoolean('refresh')
    const type = interaction.options.getString('type') || 'raw'

    let space: TwitterSpace = null
    if (!refresh) {
      space = await this.twitterSpaceService.getOneById(id, { withCreator: true })
    }

    if (!space) {
      await this.twitterSpaceControllerService.getOneById(id, { priority: 0 })
      space = await this.twitterSpaceService.getOneById(id, { withCreator: true })
    }

    if (!space) {
      await interaction.editReply(`Space ${inlineCode(id)} not found`)
      return
    }

    if (type === 'embed') {
      const embed = TwitterSpaceUtil.getEmbed(space)
      await interaction.editReply({ embeds: [embed] })
      return
    }

    const rawSpace = await this.twitterSpaceService.getRawOneById(id)
    await this.replyObject(interaction, rawSpace)
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { ArrayUtil } from '../../../../../util/array.util'
import { YOUTUBE_API_LIST_SIZE } from '../../../../youtube/constant/youtube.constant'
import { YoutubeChannel } from '../../../../youtube/model/youtube-channel.entity'
import { YoutubeChannelControllerService } from '../../../../youtube/service/controller/youtube-channel-controller.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateYoutubeChannelCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateYoutubeChannelCommand.name })

  private isRunning = false

  constructor(
    @Inject(YoutubeChannelControllerService)
    protected readonly youtubeChannelControllerService: YoutubeChannelControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('channel')
      .setDescription('Channel')
      .addStringOption((option) => option
        .setName('org')
        .setDescription('Org')
        .addChoices(
          { name: 'hololive', value: 'org_hololive' },
          { name: 'vspo', value: 'org_vspo' },
        ))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    if (this.isRunning) {
      await interaction.editReply('Running...')
      return
    }

    const ids = this.getChannelIds(interaction)
    const idChunks = ArrayUtil.splitIntoChunk(ids, YOUTUBE_API_LIST_SIZE)

    try {
      this.isRunning = true
      this.logger.warn('Fetching...')

      this.logger.debug('execute', { idCount: ids.length })
      const responses = await Promise.allSettled(idChunks.map((v) => this.youtubeChannelControllerService.getManyByIds(v, true)))
      const channels = responses
        .filter((v) => v.status === 'fulfilled')
        .map((v: PromiseFulfilledResult<YoutubeChannel[]>) => v.value)
        .flat()

      await interaction.editReply(`Updated ${channels.length} channels`)
    } finally {
      this.isRunning = false
      this.logger.warn('Done!')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getChannelIds(interaction: ChatInputCommandInteraction) {
    const org = interaction.options.getString('org')

    const hololiveIds = [
      'UCJFZiqLMntJufDCHc6bQixg',
      'UCotXwY6s8pWmuWd_snKYjhg',
      'UCfrWoRGlawPQDQxxeIDRP0Q',
      'UCp6993wxpyDPHUpavwDFqgg',
      'UCDqI2jOz0weumE8s7paEk6g',
      'UC-hM6YJuNYVAmUWxeIr9FeA',
      'UC5CwaMl1eIgY8h02uZw7u8A',
      'UC0TXe_LYZ4scaW2XMyi5_kw',
      'UCD8HOxPs4Xvsm8H0ZxXGiBw',
      'UCdn5BQ06XqgXoAxIhbqw5Rg',
      'UCQ0UDLQCjY0rmuxCDE38FGg',
      'UCFTLzh12_nrtzqBPsTCqenA',
      'UC1CfXB_kRs3C-zaeTG3oGyg',
      'UC1opHUrw8rvnsadT-iGp7Cg',
      'UCXTpFs_3PqI41qX2d9tL2Rw',
      'UC7fk0CB07ly8oSl0aqKkqFg',
      'UC1suqwovbL1kzsoaZgFZLKg',
      'UCvzGlP9oQwU--Y0r9id_jnA',
      'UCp-5t9SrOQwXMU7iIjQfARg',
      'UCvaTdHTWBGv3MKj3KVqJVCw',
      'UChAnqc_AY5_I3Px5dig3X1Q',
      'UC1DCedRgGHBdm81E1llLhOQ',
      'UCl_gCybOJRIgOXw6Qb4qJzQ',
      'UCvInZx9h3jC2JzsIzoOebWg',
      'UCdyqAaZDKHXg4Ahi7VENThQ',
      'UCCzUftO8KOVkV4wQG1vkUvg',
      'UCZlDXzGoo7d44bwdNObFacg',
      'UCS9uQI-jC3DE0L4IpXyvr6w',
      'UCqm3BQLlJfvkTsX_hvm0UmA',
      'UC1uv2Oq6kNxgATlCiez59hw',
      'UCa9Y57gfeY0Zro_noHRVrnw',
      'UCFKOVgVbGmX65RxO3EtH3iw',
      'UCAWSyEs_Io8MtpY3m-zqILA',
      'UCUKD-uaobj9jiqB-VXt71mA',
      'UCgZuwn-O7Szh9cAgHqJ6vjw',
      'UCK9V2B22uJYu3N7eR_BT9QA',
      'UCENwRMx5Yh42zWpzURebzTw',
      'UCs9_O1tRPMQTHQ-N_L6FU2g',
      'UC6eWCld0KwmyHFbAqK3V-Rw',
      'UCIBY1ollUsauvVi4hW4cumw',
      'UC_vMYWcDjmfdpH6r4TTn1MQ',
      'UCL_qhgtOy0dy1Agp8vkySQg',
      'UCHsx4Hqa-1ORjQTh9TYDhww',
      'UCMwGHR0BTZuLsmjY_NT5Pwg',
      'UCoSrY_IQQVpmIRZ9Xf-y93g',
      'UCyl1z3jo3XHR1riLFKG5UAg',
      'UC8rcEBzJSleTkf_-agPM20g',
      'UCsUj0dszADCGbF3gNrQEuSQ',
      'UCO_aKKYxn4tvrqPjcTzZ6EQ',
      'UCmbs8T6MWqUHP1tIQvSgKrg',
      'UC3n5uGu18FoCy23ggWWp8tA',
      'UCgmPnx-EEeOrZSg5Tiw7ZRQ',
      'UCKYyiJwNg2nV7hM86U5_wvw',
      'UCOyYb1c43VlX9rc_lT6NKQw',
      'UCP0BspO_AMEe3aQqqpo89Dg',
      'UCAoy6rzhSf4ydcYjJw3WoVg',
      'UCYz_5n-uDuChHtLo7My1HnQ',
      'UC727SQYUvx5pDDGQpTICNWg',
      'UChgTyjG-pdNvxxhdsXfHQ5Q',
      'UCTvHWSfBZgtxE4sILOaurIQ',
      'UCZLZ8Jjx_RN2CXloOmgTHVg',
      'UCjLEmnpCNeisMxy134KPwWw',
    ]

    const vspoIds = [
      'UCuI5XaO-6VkOEhHao6ij7JA',
      'UCgTzsBI0DIRopMylJEDqnog',
      'UCiMG6VdScBabPhJ1ZtaVmbw',
      'UCyLGcqYs7RsBb3L0SJfzGYA',
      'UC5LyYg6cCA4yHEYvtUsir3g',
      'UCIcAj6WkJ8vZ7DeJVgmeqKw',
      'UCvUc0m317LWTTPZoBQV479A',
      'UCGWa1dMU_sDCaRQjdabsVgg',
      'UCnvVG9RbOW3J6Ifqo-zKLiw',
      'UCF_U2GCKHvDz52jWdizppIA',
      'UCurEA8YoqFwimJcAuSHU0MQ',
      'UCMp55EbT_ZlqiMS3lCj01BQ',
      'UCjXBuHmWkieBApgBhDuJMMQ',
      'UCPkKpOHxEDcwmUAnRpIu-Ng',
      'UCD5W21JqNMv_tV9nfjvF9sw',
      'UCIjdfjcSaEgdjwbgjxC3ZWg',
      'UC61OwuYOVuKkpKnid-43Twg',
      'UCzUNASdzI4PV5SlqtYwAkKQ',
    ]

    switch (org) {
      case 'org_hololive':
        return [...hololiveIds]
      case 'org_vspo':
        return [...vspoIds]
      default:
        return [
          ...hololiveIds,
          ...vspoIds,
        ]
    }
  }
}

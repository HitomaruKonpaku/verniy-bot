import { APIEmbed, codeBlock, inlineCode, time } from 'discord.js'
import { TwitchStream } from '../model/twitch-stream.entity'

export class TwitchUtil {
  public static getUserUrl(username: string) {
    return `https://www.twitch.tv/${username}`
  }

  public static getEmbed(stream: TwitchStream) {
    const embed: APIEmbed = {
      title: stream.game?.name
        ? `${inlineCode(stream.user.username)} is playing ${inlineCode(stream.game.name)}`
        : `${inlineCode(stream.user.username)} live!`,
      description: TwitchUtil.getUserUrl(stream.user.username),
      color: 0x6441a5,
      author: {
        name: stream.user.username,
        url: TwitchUtil.getUserUrl(stream.user.username),
        icon_url: stream.user.profileImageUrl,
      },
      fields: [
        {
          name: 'Id',
          value: codeBlock(stream.id),
        },
        {
          name: 'Title',
          value: codeBlock(stream.title),
        },
        {
          name: '▶️ Started at',
          value: TwitchUtil.getEmbedLocalTime(stream.createdAt),
          inline: true,
        },
      ],
      footer: {
        text: 'Twitch',
        icon_url: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png',
      },
    }

    if (stream.thumbnailUrl) {
      embed.image = {
        url: stream.thumbnailUrl
          .replace('{width}', '1920')
          .replace('{height}', '1080'),
      }
    }

    return embed
  }

  public static getEmbedLocalTime(ms: number) {
    if (!ms) {
      return null
    }
    return [
      time(Math.floor(ms / 1000)),
      time(Math.floor(ms / 1000), 'R'),
    ].join('\n')
  }
}

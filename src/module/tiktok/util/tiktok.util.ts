import { APIEmbed } from 'discord-api-types/v10'
import { bold, codeBlock, inlineCode, time } from 'discord.js'
import { TiktokUser } from '../model/tiktok-user.entity'
import { TiktokVideo } from '../model/tiktok-video.entity'

export class TiktokUtil {
  public static readonly MAIN_URL = 'https://www.tiktok.com'

  public static getUserUrl(username: string, baseUrl?: string) {
    return new URL(`@${username}`, baseUrl || this.MAIN_URL).href
  }

  public static getVideoUrl(username: string, videoId: string, baseUrl?: string) {
    return new URL(`@${username}/video/${videoId}`, baseUrl || this.MAIN_URL).href
  }

  public static getVideoAttachmentUrl(username: string, videoId: string, baseProxyUrl: string) {
    const url = new URL('download', baseProxyUrl)
    url.searchParams.append('user', username)
    url.searchParams.append('id', videoId)
    return url.href
  }

  public static getVideoEmbed(video: TiktokVideo, user: TiktokUser, baseUrl?: string) {
    const embed: APIEmbed = {
      title: `${bold(inlineCode(user.username))} posted a new video`,
      description: [
        this.getVideoUrl(user.username, video.id),
        this.getVideoUrl(user.username, video.id, baseUrl),
      ].join('\n'),
      color: 0xf18719,
      author: {
        name: user.username,
        url: this.getUserUrl(user.username, baseUrl),
      },
      fields: [],
      footer: {
        text: 'TikTok',
      },
    }
    if (video.description) {
      embed.fields.push({ name: 'Description', value: codeBlock(video.description) })
    }
    if (video.createdAt) {
      embed.fields.push({ name: 'Created at', value: this.getEmbedLocalTime(video.createdAt) })
    }
    return embed
  }

  public static getEmbedLocalTime(ms: number) {
    if (!ms) {
      return null
    }
    return [
      time(ms),
      time(ms, 'R'),
    ].join('\n')
  }
}

import { bold, inlineCode, time } from '@discordjs/builders'
import { MessageEmbedOptions } from 'discord.js'
import { InstagramPost } from '../models/instagram-post.entity'
import { InstagramUser } from '../models/instagram-user.entity'

export class InstagramUtils {
  public static getUserUrl(username: string) {
    return `https://www.instagram.com/${username}`
  }

  public static getPostUrl(shortcode: string) {
    return `https://www.instagram.com/p/${shortcode}`
  }

  public static getPostEmbed(post: InstagramPost, user: InstagramUser) {
    const embed: MessageEmbedOptions = {
      title: this.getPostEmbedTitle(post, user),
      description: InstagramUtils.getPostUrl(post.shortcode),
      color: 0xDD2A7B,
      author: {
        name: user.username,
        url: InstagramUtils.getUserUrl(user.username),
        icon_url: user.profileImageUrl,
      },
      fields: [
        { name: 'Taken at', value: this.getEmbedLocalTime(post.createdAt), inline: true },
      ],
      image: { url: post.displayUrl },
      footer: {
        text: 'Instagram',
        icon_url: 'https://static.cdninstagram.com/rsrc.php/v3/y-/r/99-GUnvE0f7.png',
      },
    }
    return embed
  }

  public static getPostEmbedTitle(post: InstagramPost, user: InstagramUser) {
    const username = bold(inlineCode(user.username))
    if (post.videoUrl) {
      return `${username} have a new video`
    }
    return `${username} have a new image`
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

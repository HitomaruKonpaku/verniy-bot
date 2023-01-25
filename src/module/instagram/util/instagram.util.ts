import { APIEmbed } from 'discord-api-types/v10'
import { bold, inlineCode, time } from 'discord.js'
import { InstagramPost } from '../model/instagram-post.entity'
import { InstagramStory } from '../model/instagram-story.entity'
import { InstagramUser } from '../model/instagram-user.entity'

export class InstagramUtil {
  public static getUserUrl(username: string) {
    return `https://www.instagram.com/${username}`
  }

  public static getPostUrl(shortcode: string) {
    return `https://www.instagram.com/p/${shortcode}`
  }

  public static getStoryUrl(username: string, storyId: string) {
    return `https://www.instagram.com/stories/${username}/${storyId}`
  }

  public static getPostEmbed(user: InstagramUser, post: InstagramPost) {
    const embed: APIEmbed = {
      title: this.getPostEmbedTitle(user, post),
      description: InstagramUtil.getPostUrl(post.shortcode),
      color: 0xDD2A7B,
      author: {
        name: user.username,
        url: InstagramUtil.getUserUrl(user.username),
        icon_url: user.profileImageUrl,
      },
      fields: [],
      footer: {
        text: 'Instagram',
        icon_url: 'https://static.cdninstagram.com/rsrc.php/v3/y-/r/99-GUnvE0f7.png',
      },
    }
    if (post.createdAt) {
      embed.fields.push({
        name: 'Taken at',
        value: this.getEmbedLocalTime(post.createdAt),
        inline: true,
      })
    }
    return embed
  }

  public static getPostEmbedTitle(user: InstagramUser, post: InstagramPost) {
    const username = bold(inlineCode(user.username))
    if (post.videoUrl) {
      return `${username} posted a new video`
    }
    return `${username} posted a new image`
  }

  public static getStoryEmbed(user: InstagramUser, story: InstagramStory) {
    const embed: APIEmbed = {
      title: this.getStoryEmbedTitle(user),
      description: InstagramUtil.getStoryUrl(user.username, story.id),
      color: 0xDD2A7B,
      author: {
        name: user.username,
        url: InstagramUtil.getUserUrl(user.username),
        icon_url: user.profileImageUrl,
      },
      fields: [],
      footer: {
        text: 'Instagram',
        icon_url: 'https://static.cdninstagram.com/rsrc.php/v3/y-/r/99-GUnvE0f7.png',
      },
    }
    if (story.createdAt) {
      embed.fields.push({
        name: 'Taken at',
        value: this.getEmbedLocalTime(story.createdAt),
        inline: true,
      })
    }
    if (story.expiringAt) {
      embed.fields.push({
        name: 'Expiring at',
        value: this.getEmbedLocalTime(story.expiringAt),
        inline: true,
      })
    }
    return embed
  }

  public static getStoryEmbedTitle(user: InstagramUser) {
    const username = bold(inlineCode(user.username))
    return `${username} add a new story`
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

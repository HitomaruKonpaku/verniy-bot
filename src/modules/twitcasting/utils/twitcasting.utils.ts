import { APIEmbed } from 'discord-api-types/v10'
import { codeBlock, time } from 'discord.js'
import { TwitCastingMovie } from '../models/twitcasting-movie.entity'

export class TwitCastingUtils {
  public static getUserUrl(screenId: string) {
    return `https://twitcasting.tv/${screenId}`
  }

  public static getMovieUrl(userId: string, movieId: string) {
    return `${this.getUserUrl(userId)}/movie/${movieId}`
  }

  public static getEmbed(movie: TwitCastingMovie) {
    const { user } = movie
    const embed: APIEmbed = {
      title: `${user.screenId} live!`,
      description: this.getMovieUrl(user.screenId, movie.id),
      url: this.getUserUrl(user.screenId),
      color: 0x4589ff,
      author: {
        name: user.screenId,
        url: this.getUserUrl(user.screenId),
        icon_url: user.image,
      },
      fields: [],
      footer: {
        text: 'TwitCasting',
        icon_url: 'https://twitcasting.tv/img/icon192.png',
      },
    }
    if (movie.title) {
      embed.fields.push({
        name: 'Title',
        value: codeBlock(movie.title.trim()),
      })
    }
    // if (movie.subtitle) {
    //   embed.fields.push({
    //     name: 'Subtitle',
    //     value: codeBlock(movie.subtitle.trim()),
    //   })
    // }
    // if (movie.lastOwnerComment) {
    //   embed.fields.push({
    //     name: 'Owner comment',
    //     value: codeBlock(movie.lastOwnerComment.trim()),
    //   })
    // }
    if (movie.createdAt) {
      embed.fields.push(
        {
          name: '▶️ Started at',
          value: this.getEmbedLocalTime(movie.createdAt),
          inline: true,
        },
      )
    }
    if (movie.largeThumbnail || movie.smallThumbnail) {
      embed.image = { url: movie.largeThumbnail || movie.smallThumbnail }
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

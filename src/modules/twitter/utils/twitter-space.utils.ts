import { APIEmbed, APIEmbedField } from 'discord-api-types/v10'
import { codeBlock, inlineCode, time } from 'discord.js'
import { TrackTwitterSpace } from '../../track/models/track-twitter-space.entity'
import { SpaceState } from '../enums/twitter-space.enum'
import { TwitterSpace } from '../models/twitter-space.entity'
import { TwitterUtils } from './twitter.utils'

export class TwitterSpaceUtils {
  public static getMasterPlaylistUrl(url: string) {
    return url
      // Handle live playlist
      .replace('?type=live', '')
      .replace('dynamic_playlist', 'master_playlist')
      // Handle replay playlist
      .replace('?type=replay', '')
      .replace(/playlist_\d+/g, 'master_playlist')
  }

  public static getEmbed(space: TwitterSpace, trackItem: TrackTwitterSpace) {
    const creator = space?.creator
    const embed: APIEmbed = {
      title: TwitterSpaceUtils.getEmbedTitle(space, trackItem),
      color: 0x1d9bf0,
      description: TwitterUtils.getSpaceUrl(space.id),
      author: {
        name: `${creator?.name} (@${creator?.username})`,
        url: TwitterUtils.getUserUrl(creator?.username),
        icon_url: creator?.profileImageUrl,
      },
      fields: TwitterSpaceUtils.getEmbedFields(space),
      footer: {
        text: 'Twitter',
        icon_url: 'https://abs.twimg.com/favicons/twitter.2.ico',
      },
    }
    return embed
  }

  public static getEmbedTitle(space: TwitterSpace, track: TrackTwitterSpace) {
    const displayCreator = inlineCode(space.creator?.username || space.creatorId)
    if (space.state === SpaceState.SCHEDULED) {
      return `${displayCreator} scheduled a Space`
    }
    if (space.state === SpaceState.ENDED) {
      return `${displayCreator} ended a Space`
    }
    if (space.creatorId !== track.userId) {
      if (space.hostIds?.includes?.(track.userId)) {
        const displayGuest = inlineCode(space.hosts?.find?.((v) => v.id === track.userId)?.username || track.userId)
        return `${displayGuest} is co-hosting ${displayCreator}'s Space`
      }
      if (space.speakerIds?.includes?.(track.userId)) {
        const displayGuest = inlineCode(space.speakers?.find?.((v) => v.id === track.userId)?.username || track.userId)
        return `${displayGuest} is speaking in ${displayCreator}'s Space`
      }
    }
    return `${displayCreator} is hosting a Space`
  }

  public static getEmbedFields(space: TwitterSpace) {
    const fields: APIEmbedField[] = [
      {
        name: 'Title',
        value: codeBlock(space.title),
      },
    ]
    if (space.state === SpaceState.SCHEDULED) {
      fields.push(
        {
          name: '⏰ Scheduled start',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.scheduledStart),
          inline: true,
        },
      )
    }
    if ([SpaceState.LIVE, SpaceState.ENDED].includes(space.state)) {
      fields.push(
        {
          name: '▶️ Started at',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.startedAt),
          inline: true,
        },
      )
    }
    if ([SpaceState.ENDED].includes(space.state)) {
      fields.push(
        {
          name: '⏹️ Ended at',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.endedAt),
          inline: true,
        },
      )
    }
    if ([SpaceState.LIVE, SpaceState.ENDED].includes(space.state)) {
      fields.push(
        {
          name: 'Playlist url',
          value: codeBlock(space.playlistUrl || null),
        },
      )
    }
    return fields
  }

  public static getEmbedTimestamp(ms: number) {
    return codeBlock(String(ms))
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

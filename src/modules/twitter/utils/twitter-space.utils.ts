import { codeBlock, inlineCode, time } from '@discordjs/builders'
import { EmbedFieldData, MessageEmbedOptions } from 'discord.js'
import { TrackTwitterSpace } from '../../track/models/track-twitter-space.entity'
import { TwitterSpace } from '../models/twitter-space.entity'
import { TwitterUtils } from './twitter.utils'

export class TwitterSpaceUtils {
  public static getMasterPlaylistUrl(url: string) {
    return url
      .replace('?type=live', '')
      .replace('dynamic', 'master')
  }

  public static getEmbed(space: TwitterSpace, trackItem: TrackTwitterSpace) {
    const creator = space?.creator
    const embed: MessageEmbedOptions = {
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
    if (space.state === 'scheduled') {
      return `${displayCreator} scheduled a Space`
    }
    if (space.state === 'ended') {
      return `${displayCreator} ended a Space`
    }
    if (space.creatorId !== track.twitterUserId) {
      if (space.hostIds?.includes?.(track.twitterUserId)) {
        // eslint-disable-next-line max-len
        const displayGuest = inlineCode(space.hosts?.find?.((v) => v.id === track.twitterUserId)?.username || track.twitterUserId)
        return `${displayGuest} is co-hosting ${displayCreator}'s Space`
      }
      if (space.speakerIds?.includes?.(track.twitterUserId)) {
        // eslint-disable-next-line max-len
        const displayGuest = inlineCode(space.speakers?.find?.((v) => v.id === track.twitterUserId)?.username || track.twitterUserId)
        return `${displayGuest} is speaking in ${displayCreator}'s Space`
      }
    }
    return `${displayCreator} is hosting a Space`
  }

  public static getEmbedFields(space: TwitterSpace) {
    const fields: EmbedFieldData[] = [
      {
        name: 'Title',
        value: codeBlock(space.title),
      },
    ]
    if (space.state === 'scheduled') {
      fields.push(
        // {
        //   name: 'Scheduled at',
        //   value: TwitterSpaceUtils.getEmbedTimestamp(space.scheduledStart),
        //   inline: true,
        // },
        {
          name: 'Scheduled at',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.scheduledStart),
          inline: true,
        },
      )
    }
    if (['live', 'ended'].includes(space.state)) {
      fields.push(
        // {
        //   name: 'Started at',
        //   value: TwitterSpaceUtils.getEmbedTimestamp(space.startedAt),
        //   inline: true,
        // },
        {
          name: 'Started at',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.startedAt),
          inline: true,
        },
      )
    }
    if (['ended'].includes(space.state)) {
      fields.push(
        // {
        //   name: 'Ended at',
        //   value: TwitterSpaceUtils.getEmbedTimestamp(space.endedAt),
        //   inline: true,
        // },
        {
          name: 'Ended at',
          value: TwitterSpaceUtils.getEmbedLocalTime(space.endedAt),
          inline: true,
        },
      )
    }
    if (['live', 'ended'].includes(space.state)) {
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

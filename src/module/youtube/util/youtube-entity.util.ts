/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import VideoInfo from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import { YoutubeChannel } from '../model/youtube-channel.entity'
import { YoutubePlaylistItem } from '../model/youtube-playlist-item.entity'
import { YoutubePlaylist } from '../model/youtube-playlist.entity'
import { YoutubeVideo } from '../model/youtube-video.entity'
import { YoutubeApiUtil } from './youtube-api.util'
import { YoutubeUtil } from './youtube.util'

export class YoutubeEntityUtil {
  public static buildChannel(data: youtube_v3.Schema$Channel) {
    const obj: YoutubeChannel = {
      id: data.id,
      isActive: true,
      createdAt: YoutubeUtil.parseDate(data.snippet.publishedAt),
      updatedAt: Date.now(),
      name: data.snippet.title,
      description: data.snippet.description,
      thumbnailUrl: YoutubeApiUtil.getThumbnailUrl(data.snippet.thumbnails),
      customUrl: data.snippet.customUrl,
      country: data.snippet.country,
      videoCount: Number(data.statistics.videoCount),
      subscriberCount: Number(data.statistics.subscriberCount),
      viewCount: Number(data.statistics.viewCount),
    }
    return obj
  }

  public static buildVideo(data: youtube_v3.Schema$Video) {
    const obj: YoutubeVideo = {
      id: data.id,
      isActive: true,
      createdAt: YoutubeUtil.parseDate(data.snippet.publishedAt),
      updatedAt: Date.now(),
      channelId: data.snippet.channelId,
      categoryId: data.snippet.categoryId,
      title: data.snippet.title,
      // description: data.snippet.description,
      thumbnailUrl: YoutubeApiUtil.getThumbnailUrl(data.snippet.thumbnails),
      privacyStatus: data.status.privacyStatus as any,
      uploadStatus: data.status.uploadStatus as any,
      liveBroadcastContent: data.snippet.liveBroadcastContent,
      scheduledStartTime: YoutubeUtil.parseDate(data.liveStreamingDetails?.scheduledStartTime),
      actualStartTime: YoutubeUtil.parseDate(data.liveStreamingDetails?.actualStartTime),
      actualEndTime: YoutubeUtil.parseDate(data.liveStreamingDetails?.actualEndTime),
      viewCount: Number(data.statistics.viewCount),
      likeCount: Number(data.statistics.likeCount),
      commentCount: Number(data.statistics.commentCount),
    }
    return obj
  }

  public static buildVideoFromFeedEntry(data: any) {
    const obj: YoutubeVideo = {
      id: data['yt:videoId'],
      isActive: true,
      createdAt: YoutubeUtil.parseDate(data.published),
      channelId: data['yt:channelId'],
      title: data.title,
    }
    return obj
  }

  public static buildVideoInfo(data: VideoInfo) {
    const obj: Omit<YoutubeVideo, 'id'> = {
      isActive: true,
      updatedAt: Date.now(),
      channelId: data.basic_info.channel_id,
      isLiveContent: data.basic_info.is_live_content,
      isLive: data.basic_info.is_live,
      isUpcoming: data.basic_info.is_upcoming,
      isMembersOnly: true
        && data.playability_status.status === 'UNPLAYABLE'
        && data.playability_status.reason.includes('members-only content'),
      title: data.basic_info.title,
      actualStartTime: data.basic_info.start_timestamp?.getTime(),
    }
    return obj
  }

  public static buildPlaylist(data: youtube_v3.Schema$Playlist) {
    const obj: YoutubePlaylist = {
      id: data.id,
      isActive: true,
      createdAt: YoutubeUtil.parseDate(data.snippet.publishedAt),
      updatedAt: Date.now(),
      channelId: data.snippet.channelId,
      title: data.snippet.title,
      description: data.snippet.description,
      thumbnailUrl: YoutubeApiUtil.getThumbnailUrl(data.snippet.thumbnails),
      privacyStatus: data.status.privacyStatus as any,
    }
    return obj
  }

  public static buildPlaylistItem(data: youtube_v3.Schema$PlaylistItem) {
    const obj: YoutubePlaylistItem = {
      id: data.id,
      isActive: true,
      createdAt: YoutubeUtil.parseDate(data.snippet.publishedAt),
      updatedAt: Date.now(),
      channelId: data.snippet.channelId,
      playlistId: data.snippet.playlistId,
      videoId: data.contentDetails.videoId,
      position: data.snippet.position,
    }
    return obj
  }
}

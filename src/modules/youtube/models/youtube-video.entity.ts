import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { PrivacyStatus, UploadStatus } from '../enums/youtube.enum'
import { YoutubeChannel } from './youtube-channel.entity'
import { YoutubePlaylistItem } from './youtube-playlist-item.entity'

@Entity('youtube_video')
export class YoutubeVideo extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'category_id', type: 'text', nullable: true })
  categoryId?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  @Column({ name: 'privacy_status', type: 'text', nullable: true })
  privacyStatus?: PrivacyStatus

  @Column({ name: 'upload_status', type: 'text', nullable: true })
  uploadStatus?: UploadStatus

  @Column({ name: 'live_broadcast_content', type: 'text', nullable: true })
  liveBroadcastContent?: string

  @Column({ name: 'scheduled_start_time', type: 'numeric', nullable: true })
  scheduledStartTime?: number

  @Column({ name: 'actual_start_time', type: 'numeric', nullable: true })
  actualStartTime?: number

  @Column({ name: 'actual_end_time', type: 'numeric', nullable: true })
  actualEndTime?: number

  @Column({ name: 'view_count', type: 'numeric', nullable: true })
  viewCount?: number

  @Column({ name: 'like_count', type: 'numeric', nullable: true })
  likeCount?: number

  @Column({ name: 'comment_count', type: 'numeric', nullable: true })
  commentCount?: number

  channel?: YoutubeChannel

  playlistItems?: YoutubePlaylistItem[]
}

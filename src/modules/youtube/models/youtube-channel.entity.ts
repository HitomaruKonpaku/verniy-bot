import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/models/base-external-user.entity'
import { YoutubePlaylistItem } from './youtube-playlist-item.entity'
import { YoutubePlaylist } from './youtube-playlist.entity'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_channel')
export class YoutubeChannel extends BaseExternalUserEntity {
  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  @Column({ name: 'custom_url', type: 'text', nullable: true })
  customUrl?: string

  @Column({ name: 'country', type: 'text', nullable: true })
  country?: string

  @Column({ name: 'video_count', type: 'numeric', nullable: true })
  videoCount?: number

  @Column({ name: 'subscriber_count', type: 'numeric', nullable: true })
  subscriberCount?: number

  @Column({ name: 'view_count', type: 'numeric', nullable: true })
  viewCount?: number

  videos?: YoutubeVideo[]

  playlists?: YoutubePlaylist[]

  playlistItems?: YoutubePlaylistItem[]
}

import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { PrivacyStatus } from '../enum/youtube.enum'
import { YoutubeChannel } from './youtube-channel.entity'
import { YoutubePlaylistItem } from './youtube-playlist-item.entity'

@Entity('youtube_playlist')
export class YoutubePlaylist extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  @Column({ name: 'privacy_status', type: 'text', nullable: true })
  privacyStatus?: PrivacyStatus

  channel?: YoutubeChannel

  items?: YoutubePlaylistItem[]
}

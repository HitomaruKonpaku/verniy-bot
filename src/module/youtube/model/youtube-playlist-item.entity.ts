import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { YoutubeChannel } from './youtube-channel.entity'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_playlist_item')
export class YoutubePlaylistItem extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'video_id', type: 'text' })
  videoId: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number

  channel?: YoutubeChannel

  video?: YoutubeVideo
}

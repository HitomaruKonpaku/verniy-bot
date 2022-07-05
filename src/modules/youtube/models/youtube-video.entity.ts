import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_video')
export class YoutubeVideo extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  @Column({ name: 'scheduled_start_time', type: 'numeric', nullable: true })
  scheduledStartTime?: number

  @Column({ name: 'actual_start_time', type: 'numeric', nullable: true })
  actualStartTime?: number

  @Column({ name: 'actual_end_time', type: 'numeric', nullable: true })
  actualEndTime?: number

  channel?: YoutubeChannel
}

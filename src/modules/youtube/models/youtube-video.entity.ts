import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_video')
export class YoutubeVideo extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  channel?: YoutubeChannel
}

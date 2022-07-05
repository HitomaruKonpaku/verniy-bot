import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_channel')
export class YoutubeChannel extends BaseExternalEntity {
  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'country', type: 'text', nullable: true })
  country?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  videos?: YoutubeVideo[]
}

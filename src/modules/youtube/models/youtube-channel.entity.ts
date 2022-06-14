import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_channel')
export class YoutubeChannel extends BaseExternalEntity {
  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string

  videos?: YoutubeVideo[]
}

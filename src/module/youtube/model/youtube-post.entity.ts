import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_post')
export class YoutubePost extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  channel?: YoutubeChannel
}

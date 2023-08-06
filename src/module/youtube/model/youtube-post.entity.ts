import { Column, Entity } from 'typeorm'
import { Thumbnail } from 'youtubei.js/dist/src/parser/misc'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { dbArrayTransformer } from '../../database/transformer/transformer'
import { YoutubeChannel } from './youtube-channel.entity'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_post')
export class YoutubePost extends BaseExternalEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'author_id', type: 'text' })
  authorId: string

  @Column({ name: 'type', type: 'text', nullable: true })
  type?: string

  @Column({ name: 'is_members_only', type: 'boolean', default: false })
  isMembersOnly?: boolean

  @Column({ name: 'video_id', type: 'text', nullable: true })
  videoId?: string

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string

  @Column({
    name: 'images',
    type: 'text',
    nullable: true,
    transformer: dbArrayTransformer,
  })
  images?: Thumbnail[][]

  channel?: YoutubeChannel

  author?: YoutubeChannel

  video?: YoutubeVideo
}

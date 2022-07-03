import { ChildEntity, Column } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './track.entity'

@ChildEntity(TrackType.TWITTER_TWEET)
export class TrackTwitterTweet extends Track {
  @Column({ name: 'allow_reply', type: 'boolean', nullable: true })
  allowReply?: boolean

  @Column({ name: 'allow_retweet', type: 'boolean', nullable: true })
  allowRetweet?: boolean

  @Column({
    name: 'filter_keywords',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: string[]) => (Array.isArray(value) ? JSON.stringify(value) : null),
      from: (value: string) => JSON.parse(value),
    },
  })
  filterKeywords?: string[]
}

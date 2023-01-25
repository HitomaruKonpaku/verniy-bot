import { ChildEntity, Column } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.TWITTER_TWEET)
export class TrackTwitterTweet extends Track {
  @Column({ name: 'allow_reply', type: 'boolean', nullable: true })
  allowReply?: boolean

  @Column({ name: 'allow_retweet', type: 'boolean', nullable: true })
  allowRetweet?: boolean
}

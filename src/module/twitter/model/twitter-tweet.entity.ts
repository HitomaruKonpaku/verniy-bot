import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_tweet')
export class TwitterTweet extends BaseExternalEntity {
  @Column({ name: 'author_id', type: 'text' })
  authorId: string

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  @Column({ name: 'text', type: 'text', nullable: true })
  text?: string

  @Column({ name: 'is_translatable', type: 'boolean', nullable: true })
  isTranslatable?: boolean

  @Column({ name: 'in_reply_to_status_id', type: 'text', nullable: true })
  inReplyToStatusId?: string

  @Column({ name: 'in_reply_to_user_id', type: 'text', nullable: true })
  inReplyToUserId?: string

  @Column({ name: 'retweeted_status_id', type: 'text', nullable: true })
  retweetedStatusId?: string

  @Column({ name: 'quoted_status_id', type: 'text', nullable: true })
  quotedStatusId?: string

  author?: TwitterUser

  retweetedStatus?: TwitterTweet

  quotedStatus?: TwitterTweet
}

import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_tweet')
export class TwitterTweet extends BaseExternalEntity {
  @Column({ name: 'author_id', type: 'text' })
  authorId: string

  @Column({ name: 'text', type: 'text' })
  text: string

  @Column({ name: 'truncated', type: 'boolean', default: false })
  truncated?: boolean

  @Column({ name: 'in_reply_to_status_id', type: 'text', nullable: true })
  inReplyToStatusId?: string

  @Column({ name: 'in_reply_to_user_id', type: 'text', nullable: true })
  inReplyToUserId?: string

  @Column({ name: 'is_quote_status', type: 'boolean', default: false })
  isQuoteStatus?: boolean

  @Column({ name: 'quoted_status_id', type: 'text', nullable: true })
  quotedStatusId?: string

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  user?: TwitterUser
}

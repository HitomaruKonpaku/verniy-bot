import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm'

@Entity('twitter_discord_tweet')
@Unique(['twitterUsername', 'discordChannelId'])
export class TwitterDiscordTweet {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'twitter_username', type: 'text' })
  twitterUsername: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'allow_reply', type: 'boolean', default: true })
  allowReply: boolean

  @Column({ name: 'allow_retweet', type: 'boolean', default: true })
  allowRetweet: boolean

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

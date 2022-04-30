import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('twitter_user')
export class TwitterUser {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'created_at', type: 'numeric' })
  createdAt: Date;

  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text', nullable: true })
  name?: string

  @Column({ type: 'text', nullable: true })
  location?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'boolean', default: false })
  protected?: boolean

  @Column({ type: 'boolean', default: false })
  verified?: boolean

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'profile_banner_url', type: 'text', nullable: true })
  profileBannerUrl?: string
}

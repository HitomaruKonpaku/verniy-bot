import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { TwitCastingMovie } from './twitcasting-movie.entity'

@Entity('twitcasting_user')
export class TwitCastingUser extends BaseExternalEntity {
  @Column({ name: 'screen_id', type: 'text' })
  screenId: string

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'image', type: 'text', nullable: true })
  image?: string

  @Column({ name: 'profile', type: 'text', nullable: true })
  profile?: string

  @Column({ name: 'level', type: 'numeric', default: 0 })
  level?: number

  @Column({ name: 'last_movie_id', type: 'text', nullable: true })
  lastMovieId?: string

  @Column({ name: 'is_live', type: 'boolean', default: false })
  isLive?: boolean

  movies?: TwitCastingMovie[]
}

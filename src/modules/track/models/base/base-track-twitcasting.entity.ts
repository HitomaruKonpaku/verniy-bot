import { TwitCastingUser } from '../../../twitcasting/models/twitcasting-user.entity'
import { BaseTrackEntity } from './base-track.entity'

export abstract class BaseTrackTwitCasting extends BaseTrackEntity {
  user?: TwitCastingUser
}

import { TwitterUser } from '../../../twitter/models/twitter-user.entity'
import { BaseTrackEntity } from './base-track.entity'

export abstract class BaseTrackTwitter extends BaseTrackEntity {
  user?: TwitterUser
}

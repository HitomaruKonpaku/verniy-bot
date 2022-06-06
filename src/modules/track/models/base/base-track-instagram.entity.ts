import { InstagramUser } from '../../../instagram/models/instagram-user.entity'
import { BaseTrackEntity } from './base-track.entity'

export abstract class BaseTrackInstagram extends BaseTrackEntity {
  user?: InstagramUser
}

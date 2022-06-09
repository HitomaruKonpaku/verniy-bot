import { TiktokUser } from '../../../tiktok/models/tiktok-user.entity'
import { BaseTrackEntity } from './base-track.entity'

export abstract class BaseTrackTiktok extends BaseTrackEntity {
  user?: TiktokUser
}

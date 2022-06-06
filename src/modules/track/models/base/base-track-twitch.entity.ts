import { TwitchUser } from '../../../twitch/models/twitch-user.entity'
import { BaseTrackEntity } from './base-track.entity'

export abstract class BaseTrackTwitch extends BaseTrackEntity {
  user?: TwitchUser
}

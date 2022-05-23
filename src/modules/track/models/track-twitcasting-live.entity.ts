import { Entity, Unique } from 'typeorm'
import { TwitCastingUser } from '../../twitcasting/models/twitcasting-user.entity'
import { BaseTrackTwitCasting } from './base/base-track-twitcasting.entity'

@Entity('track_twitcasting_live')
@Unique(['twitcastingUserId', 'discordChannelId'])
export class TrackTwitCastingLive extends BaseTrackTwitCasting {
  user?: TwitCastingUser
}

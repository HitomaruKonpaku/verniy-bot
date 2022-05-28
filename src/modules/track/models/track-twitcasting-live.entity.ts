import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitCasting } from './base/base-track-twitcasting.entity'

@Entity('track_twitcasting_live')
@Unique(['twitcastingUserId', 'discordChannelId'])
export class TrackTwitCastingLive extends BaseTrackTwitCasting {
}

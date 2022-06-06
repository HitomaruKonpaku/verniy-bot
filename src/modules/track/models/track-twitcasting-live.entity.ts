import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitCasting } from './base/base-track-twitcasting.entity'

@Entity('track_twitcasting_live')
@Unique(['userId', 'discordChannelId'])
export class TrackTwitCastingLive extends BaseTrackTwitCasting {
}

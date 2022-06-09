import { Entity, Unique } from 'typeorm'
import { BaseTrackTiktok } from './base/base-track-tiktok.entity'

@Entity('track_tiktok_video')
@Unique(['userId', 'discordChannelId'])
export class TrackTiktokVideo extends BaseTrackTiktok {
}

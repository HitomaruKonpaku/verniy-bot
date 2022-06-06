import { Entity, Unique } from 'typeorm'
import { BaseTrackInstagram } from './base/base-track-instagram.entity'

@Entity('track_instagram_post')
@Unique(['userId', 'discordChannelId'])
export class TrackInstagramPost extends BaseTrackInstagram {
}

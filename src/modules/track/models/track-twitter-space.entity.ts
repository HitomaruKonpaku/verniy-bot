import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitter } from './base/base-track-twitter.entity'

@Entity('track_twitter_space')
@Unique(['userId', 'discordChannelId'])
export class TrackTwitterSpace extends BaseTrackTwitter {
}

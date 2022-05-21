import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitter } from '../../database/models/base/base-track-twitter.entity'

@Entity('track_twitter_space')
@Unique(['twitterUserId', 'discordChannelId'])
export class TrackTwitterSpace extends BaseTrackTwitter {
}

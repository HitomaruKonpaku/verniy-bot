import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitter } from './base/base-track-twitter.entity'

@Entity('track_twitter_profile')
@Unique(['twitterUserId', 'discordChannelId'])
export class TrackTwitterProfile extends BaseTrackTwitter {
}

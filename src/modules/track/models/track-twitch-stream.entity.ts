import { Entity, Unique } from 'typeorm'
import { BaseTrackTwitch } from './base/base-track-twitch.entity'

@Entity('track_twitch_stream')
@Unique(['twitchUserId', 'discordChannelId'])
export class TrackTwitchStream extends BaseTrackTwitch {
}

import { ChildEntity } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.TWITCH_LIVE)
export class TrackTwitchLive extends Track {
}

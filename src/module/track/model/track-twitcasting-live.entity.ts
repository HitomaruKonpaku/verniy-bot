import { ChildEntity } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.TWITCASTING_LIVE)
export class TrackTwitCastingLive extends Track {
}

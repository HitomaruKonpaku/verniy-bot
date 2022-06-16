import { ChildEntity } from 'typeorm'
import { Track } from '../base/track.entity'
import { TrackType } from '../enums/track-type.enum'

@ChildEntity(TrackType.TWITCASTING_LIVE)
export class TrackTwitCastingLive extends Track {
}

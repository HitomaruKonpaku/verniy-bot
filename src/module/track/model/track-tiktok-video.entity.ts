import { ChildEntity } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.TIKTOK_VIDEO)
export class TrackTiktokVideo extends Track {
}

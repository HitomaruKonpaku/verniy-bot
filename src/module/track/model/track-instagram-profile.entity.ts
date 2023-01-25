import { ChildEntity } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.INSTAGRAM_PROFILE)
export class TrackInstagramProfile extends Track {
}

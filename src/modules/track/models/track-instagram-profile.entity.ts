import { ChildEntity } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './track.entity'

@ChildEntity(TrackType.INSTAGRAM_PROFILE)
export class TrackInstagramProfile extends Track {
}

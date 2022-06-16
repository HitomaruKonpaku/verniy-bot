import { ChildEntity } from 'typeorm'
import { Track } from '../base/track.entity'
import { TrackType } from '../enums/track-type.enum'

@ChildEntity(TrackType.INSTAGRAM_POST)
export class TrackInstagramPost extends Track {
}

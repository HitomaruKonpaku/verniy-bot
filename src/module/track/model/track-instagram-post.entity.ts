import { ChildEntity } from 'typeorm'
import { TrackType } from '../enum/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.INSTAGRAM_POST)
export class TrackInstagramPost extends Track {
}

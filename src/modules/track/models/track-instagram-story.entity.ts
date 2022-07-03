import { ChildEntity } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './track.entity'

@ChildEntity(TrackType.INSTAGRAM_STORY)
export class TrackInstagramStory extends Track {
}

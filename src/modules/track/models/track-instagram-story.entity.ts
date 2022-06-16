import { ChildEntity } from 'typeorm'
import { Track } from '../base/track.entity'
import { TrackType } from '../enums/track-type.enum'

@ChildEntity(TrackType.INSTAGRAM_STORY)
export class TrackInstagramStory extends Track {
}

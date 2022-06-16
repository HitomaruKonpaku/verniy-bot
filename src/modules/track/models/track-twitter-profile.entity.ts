import { ChildEntity } from 'typeorm'
import { Track } from '../base/track.entity'
import { TrackType } from '../enums/track-type.enum'

@ChildEntity(TrackType.TWITTER_PROFILE)
export class TrackTwitterProfile extends Track {
}

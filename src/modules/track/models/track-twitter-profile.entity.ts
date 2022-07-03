import { ChildEntity } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './track.entity'

@ChildEntity(TrackType.TWITTER_PROFILE)
export class TrackTwitterProfile extends Track {
}

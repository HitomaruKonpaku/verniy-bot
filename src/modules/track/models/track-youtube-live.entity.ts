import { ChildEntity } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './track.entity'

@ChildEntity(TrackType.YOUTUBE_LIVE)
export class TrackYoutubeLive extends Track {
}

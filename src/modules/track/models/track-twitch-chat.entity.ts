import { ChildEntity } from 'typeorm'
import { TrackType } from '../enums/track-type.enum'
import { Track } from './base/track.entity'

@ChildEntity(TrackType.TWITCH_CHAT)
export class TrackTwitchChat extends Track {
}

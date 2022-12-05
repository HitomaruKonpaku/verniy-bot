import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { Track } from '../../track/models/base/track.entity'

export type TrackListItem = Pick<
  Track,
  | 'id'
  | 'isActive'
  | 'type'
  | 'userId'
  | 'filterUserId'
  | 'filterKeywords'
> & {
  username: string,
  filterUsername?: string
}

export interface TrackAddFilter<T extends BaseExternalEntity> {
  user?: T
  keywords?: string[]
}

export interface TrackRemoveFilter<T extends BaseExternalEntity> {
  user?: T
}

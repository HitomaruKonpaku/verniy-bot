import { BaseExternalEntity } from '../../database/models/base-external.entity'

export interface TrackAddFilter<T extends BaseExternalEntity> {
  user?: T
  keywords?: string[]
}

export interface TrackRemoveFilter<T extends BaseExternalEntity> {
  user?: T
}

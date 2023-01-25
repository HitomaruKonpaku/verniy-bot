import { Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_filtered_stream_user')
export class TwitterFilteredStreamUser extends BaseExternalEntity {
  user?: TwitterUser
}

import { SpaceV2, UserV1 } from 'twitter-api-v2'
import { TwitterSpace } from '../../database/models/twitter-space.entity'
import { TwitterUser } from '../../database/models/twitter-user.entity'
import { TwitterUtils } from './TwitterUtils'

export class TwitterEntityUtils {
  public static buildUser(data: UserV1): TwitterUser {
    const obj: TwitterUser = {
      id: data.id_str,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.screen_name,
      name: data.name,
      location: data.location,
      description: TwitterUtils.getUserDescription(data),
      protected: data.protected,
      verified: data.verified,
      profileImageUrl: TwitterUtils.getUserProfileImageUrl(data),
      profileBannerUrl: TwitterUtils.getUserProfileBannerUrl(data),
    }
    return obj
  }

  public static buildSpace(data: SpaceV2): TwitterSpace {
    const obj: TwitterSpace = {
      id: data.id,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      creatorId: data.creator_id,
      state: data.state,
      isTicketed: data.is_ticketed,
      scheduledStart: data.scheduled_start
        ? new Date(data.scheduled_start).getTime()
        : null,
      startedAt: data.started_at
        ? new Date(data.started_at).getTime()
        : null,
      endedAt: data.ended_at
        ? new Date(data.ended_at).getTime()
        : null,
      lang: data.lang || null,
      title: data.title || null,
    }
    return obj
  }
}

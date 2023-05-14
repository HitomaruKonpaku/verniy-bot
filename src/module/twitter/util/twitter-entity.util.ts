import { SpaceV2, TweetV2, UserV1, UserV2 } from 'twitter-api-v2'
import { SpaceState } from '../enum/twitter-space.enum'
import { AudioSpace } from '../interface/twitter-graphql.interface'
import { TwitterSpace } from '../model/twitter-space.entity'
import { TwitterTweet } from '../model/twitter-tweet.entity'
import { TwitterUser } from '../model/twitter-user.entity'
import { TwitterSpaceUtil } from './twitter-space.util'
import { TwitterUtil } from './twitter.util'

export class TwitterEntityUtil {
  public static buildUser(result: any): TwitterUser {
    const { legacy } = result
    const obj: TwitterUser = {
      id: result.rest_id,
      isActive: true,
      createdAt: new Date(legacy.created_at).getTime(),
      username: legacy.screen_name,
      name: legacy.name,
      protected: !!legacy.protected,
      verified: !!result.verification_info.reason,
      verifiedType: legacy.verified_type?.toLowerCase() || null,
      location: legacy.location,
      description: TwitterUtil.getUserDescription(legacy),
      profileImageUrl: TwitterUtil.getUserProfileImageUrl(legacy.profile_image_url_https),
      profileBannerUrl: TwitterUtil.getUserProfileBannerUrl(legacy.profile_banner_url),
      followersCount: legacy.followers_count,
      followingCount: legacy.friends_count,
      tweetCount: legacy.statuses_count,
    }
    return obj
  }

  public static buildUserV1(data: UserV1): TwitterUser {
    const obj: TwitterUser = {
      id: data.id_str,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.screen_name,
      name: data.name,
      protected: data.protected,
      // verified: data.verified,
      location: data.location,
      description: TwitterUtil.getUserDescription(data),
      profileImageUrl: TwitterUtil.getUserProfileImageUrl(data.profile_image_url_https),
      profileBannerUrl: TwitterUtil.getUserProfileBannerUrl(data.profile_banner_url),
      followersCount: data.followers_count,
      followingCount: data.friends_count,
      tweetCount: data.statuses_count,
    }
    return obj
  }

  public static buildUserV2(data: UserV2): TwitterUser {
    const obj: TwitterUser = {
      id: data.id,
      isActive: true,
      createdAt: new Date(data.created_at).getTime(),
      username: data.username,
      name: data.name,
      protected: data.protected,
      // verified: data.verified,
      location: data.location,
      profileImageUrl: TwitterUtil.getUserProfileImageUrl(data.profile_image_url),
      followersCount: data.public_metrics?.followers_count,
      followingCount: data.public_metrics?.following_count,
      tweetCount: data.public_metrics?.tweet_count,
    }
    return obj
  }

  public static buildTweet(result: any): TwitterTweet {
    const { legacy } = result
    const obj: TwitterTweet = {
      id: result.rest_id,
      createdAt: new Date(legacy.created_at).getTime(),
      authorId: legacy.user_id_str,
      lang: legacy.lang,
      text: legacy.full_text,
      isTranslatable: result.is_translatable,
      inReplyToStatusId: legacy.in_reply_to_status_id_str,
      inReplyToUserId: legacy.in_reply_to_user_id_str,
      retweetedStatusId: legacy.retweeted_status_result?.result?.rest_id,
      quotedStatusId: result.quoted_status_result?.result.rest_id,
      entities: legacy.entities,
      extendedEntities: legacy.extended_entities,
    }
    return obj
  }

  public static buildTweetV2(data: TweetV2): TwitterTweet {
    const obj: TwitterTweet = {
      id: data.id,
      createdAt: new Date(data.created_at).getTime(),
      authorId: data.author_id,
      lang: data.lang,
      text: data.text,
      inReplyToUserId: data.in_reply_to_user_id,
    }
    if (data.referenced_tweets?.length) {
      const referencedTweet = data.referenced_tweets[0]
      if (referencedTweet.type === 'replied_to') {
        obj.inReplyToUserId = referencedTweet.id
      } else if (referencedTweet.type === 'retweeted') {
        obj.retweetedStatusId = referencedTweet.id
      } else if (referencedTweet.type === 'quoted') {
        obj.quotedStatusId = referencedTweet.id
      }
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
      state: data.state as SpaceState,
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
      lang: data.lang,
      title: data.title,
      hostIds: data.host_ids,
      speakerIds: data.speaker_ids,
      participantCount: data.participant_count,
    }
    return obj
  }

  public static buildSpaceByAudioSpace(audioSpace: AudioSpace) {
    const { metadata, participants } = audioSpace
    const creator = participants.admins[0]
    const obj: TwitterSpace = {
      id: metadata.rest_id,
      isActive: true,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      creatorId: creator.user_results.rest_id,
      state: TwitterSpaceUtil.parseState(metadata.state),
      scheduledStart: metadata.scheduled_start,
      startedAt: metadata.started_at,
      endedAt: Number(metadata.ended_at) || null,
      title: metadata.title,
      hostIds: participants.admins.map((v) => v.user_results.rest_id),
      speakerIds: participants.speakers.map((v) => v.user_results.rest_id),
      totalLiveListeners: metadata.total_live_listeners,
      totalReplayWatched: metadata.total_replay_watched,
      isAvailableForReplay: metadata.is_space_available_for_replay,
      isAvailableForClipping: metadata.is_space_available_for_clipping,
    }
    return obj
  }
}

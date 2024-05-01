import { SpaceV2, TweetV2, UserV1, UserV2 } from 'twitter-api-v2'
import { NumberUtil } from '../../../util/number.util'
import { AudioSpace } from '../api/interface/twitter-graphql.interface'
import { SpaceState } from '../enum/twitter-space.enum'
import { Result as TweetResult } from '../interface/twitter-tweet.interface'
import { TwitterBroadcast } from '../model/twitter-broadcast.entity'
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
      updatedAt: Date.now(),
      username: legacy.screen_name,
      name: legacy.name,
      protected: !!legacy.protected,
      verified: !!legacy.verified_type || !!result.is_blue_verified,
      verifiedType: legacy.verified_type?.toLowerCase() || null,
      location: legacy.location,
      description: TwitterUtil.getUserDescription(legacy),
      profileImageUrl: TwitterUtil.getUserProfileImageUrl(legacy.profile_image_url_https),
      profileBannerUrl: TwitterUtil.getUserProfileBannerUrl(legacy.profile_banner_url),
      followersCount: legacy.followers_count,
      followingCount: legacy.friends_count,
      tweetCount: legacy.statuses_count,
      affiliatesCount: result.business_account?.affiliates_count,
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

  public static buildTweet(result: TweetResult): TwitterTweet {
    const tmpResult = result.tweet || result
    const { legacy } = tmpResult

    const obj: TwitterTweet = {
      id: tmpResult.rest_id,
      isActive: true,
      createdAt: new Date(legacy.created_at).getTime(),
      updatedAt: Date.now(),
      authorId: legacy.user_id_str,
      lang: legacy.lang,
      text: legacy.full_text,
      isTranslatable: tmpResult.is_translatable,
      inReplyToStatusId: legacy.in_reply_to_status_id_str,
      inReplyToUserId: legacy.in_reply_to_user_id_str,
      retweetedStatusId: legacy.retweeted_status_result?.result?.rest_id,
      quotedStatusId: tmpResult.quoted_status_result?.result?.rest_id,
      entities: legacy.entities,
      extendedEntities: legacy.extended_entities,
    }

    if (legacy?.entities?.urls?.length) {
      obj.spaceIds = legacy.entities.urls
        .filter((v) => v.expanded_url.includes('i/spaces'))
        .map((v) => TwitterSpaceUtil.parseId(v.expanded_url))
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
      modifiedAt: Date.now(),
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
      id: audioSpace.rest_id || metadata.broadcast_id || metadata.rest_id,
      isActive: true,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      modifiedAt: Date.now(),
      creatorId: creator?.user_results?.result?.rest_id || creator?.user_results?.rest_id,
      state: TwitterSpaceUtil.parseState(metadata.state),
      altState: metadata.state,
      scheduledStart: metadata.scheduled_start,
      startedAt: metadata.start || metadata.started_at,
      endedAt: NumberUtil.toNumberOrUndefined(metadata.ended_at),
      lang: metadata.language,
      title: metadata.title,
      hostIds: participants.admins.map((v) => v.user_results.result.rest_id || v.user_results.rest_id),
      speakerIds: participants.speakers.map((v) => v.user_results.result.rest_id || v.user_results.rest_id),
      participantCount: metadata.total_participated,
      totalLiveListeners: metadata.total_live_listeners,
      totalReplayWatched: metadata.total_replay_watched,
      isAvailableForReplay: metadata.is_space_available_for_replay,
      isAvailableForClipping: metadata.is_space_available_for_clipping,
      narrowCastSpaceType: metadata.narrow_cast_space_type,
      subscriberCount: audioSpace.subscriber_count,
      ticketsSold: metadata.tickets_sold,
      ticketsTotal: metadata.tickets_total,
    }
    return obj
  }

  public static buildBroadcast(data: any) {
    const obj: TwitterBroadcast = {
      id: data.id,
      isActive: true,
      createdAt: Number(data.created_at_ms),
      updatedAt: Number(data.updated_at_ms),
      modifiedAt: Date.now(),
      userId: data.twitter_user_id,
      state: data.state?.toLowerCase?.(),
      startedAt: Number(data.start_ms),
      endedAt: NumberUtil.toNumberOrUndefined(data.end_ms),
      pingedAt: NumberUtil.toNumberOrUndefined(data.ping_ms),
      lang: data.language,
      title: data.status,
      mediaId: data.media_id,
      mediaKey: data.media_key,
      imageUrl: data.image_url || data.image_url_medium || data.image_url_small,
      broadcastSource: data.broadcast_source,
      isAvailableForReplay: data.available_for_replay,
      isHighLatency: data.is_high_latency,
      hasModeration: data.has_moderation,
      privateChat: data.private_chat,
      friendChat: data.friend_chat,
      width: data.width,
      height: data.height,
      cameraRotation: data.camera_rotation,
      hasLocation: data.has_location,
      lat: data.lat,
      lng: data.lng,
      totalWatching: NumberUtil.toNumberOrUndefined(data.total_watching),
      totalWatched: NumberUtil.toNumberOrUndefined(data.total_watched),
    }
    return obj
  }
}

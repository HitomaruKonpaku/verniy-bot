import axios from 'axios'
import { TWITTER_API_URL } from '../constant/twitter.constant'
import { TwitterAuthCookieHeaders } from '../interface/twitter-api.interface'

export class TwitterFleetApi {
  public static async getAvatarContent(
    userIds: string[],
    headers: TwitterAuthCookieHeaders,
  ) {
    const url = 'fleets/v1/avatar_content'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        only_spaces: true,
        user_ids: userIds.join(','),
      },
    })
    return response
  }

  public static async getFleetline(
    headers: TwitterAuthCookieHeaders,
  ) {
    const url = 'fleets/v1/fleetline'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        only_spaces: true,
      },
    })
    return response
  }
}

import axios from 'axios'
import { TWITTER_API_URL } from '../constant/twitter.constant'
import { TwitterAuthGuestTokenHeaders } from '../interface/twitter-api.interface'

export class TwitterLiveVideoStreamApi {
  public static async getStatus(
    mediaKey: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = `1.1/live_video_stream/status/${mediaKey}`
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
    })
    return response
  }
}

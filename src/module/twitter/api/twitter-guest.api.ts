import axios from 'axios'
import { TWITTER_API_URL } from '../constant/twitter.constant'
import { TwitterAuthHeaders } from '../interface/twitter-api.interface'

export class TwitterGuestApi {
  public static async postActivate(
    headers: TwitterAuthHeaders,
  ) {
    const response = await axios.request({
      method: 'POST',
      url: '1.1/guest/activate.json',
      baseURL: TWITTER_API_URL,
      headers,
    })
    return response
  }
}

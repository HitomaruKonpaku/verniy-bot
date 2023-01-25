import axios from 'axios'
import { TWITTER_API_URL } from '../constants/twitter.constant'
import { TwitterAuthHeaders } from '../interfaces/twitter-api.interface'

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

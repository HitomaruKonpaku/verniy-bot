import axios from 'axios'

export class YoutubeFeedApi {
  public static async getVideos(channelId: string) {
    const url = 'https://www.youtube.com/feeds/videos.xml'
    const response = await axios.get(url, {
      params: { channel_id: channelId },
    })
    return response
  }
}

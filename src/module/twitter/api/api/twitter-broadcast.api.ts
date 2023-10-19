import { TwitterBaseApi } from '../base/twitter-base.api'

export class TwitterBroadcastApi extends TwitterBaseApi {
  public async show(ids: string[]) {
    const url = 'show.json'
    const params = new URLSearchParams()
    params.append('include_events', 'true')
    ids.forEach((id) => {
      params.append('ids', id)
    })
    const res = await this.client.get(url, {
      params,
    })
    return res
  }
}

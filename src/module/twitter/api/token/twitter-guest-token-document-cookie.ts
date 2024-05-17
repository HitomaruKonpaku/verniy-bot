import axios from 'axios'
import Bottleneck from 'bottleneck'
import { USER_AGENT } from '../../../../constant/app.constant'
import { baseLogger } from '../../../../logger'
import { TwitterGuestTokenBase } from '../base/twitter-guest-token-base'

export class TwitterGuestTokenDocumentCookie extends TwitterGuestTokenBase {
  protected logger = baseLogger.child({ context: TwitterGuestTokenDocumentCookie.name })

  constructor(
    protected readonly limiter: Bottleneck,
  ) {
    super(limiter)
  }

  // eslint-disable-next-line class-methods-use-this
  public async fetchToken(): Promise<string> {
    const { data } = await axios.request({
      method: 'GET',
      url: 'https://x.com/?mx=2',
      headers: {
        'user-agent': USER_AGENT,
      },
      beforeRedirect(options, responseDetails) {
        const cookie = (responseDetails.headers['set-cookie'] as any as string[])
          .map((v) => v.split(';')[0]).join('; ')
        Object.assign(options.headers, { cookie })
      },
    })
    const token = /(?<=gt=)\d+/.exec(data)?.[0]
    return token
  }
}

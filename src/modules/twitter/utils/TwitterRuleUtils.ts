import { TWITTER_STREAM_RULE_LENGTH } from '../constants/twitter.constant'

export class TwitterRuleUtils {
  public static calcRuleLength(usernames: string[]): number {
    return usernames.reduce((pv, cv) => pv + cv.length, 0)
      + usernames.length * 5 // `from:` length
      + (usernames.length - 1) * 4 // ` OR ` length
  }

  public static calcRuleRemainLength(
    usernames: string[],
    ruleMaxLength = TWITTER_STREAM_RULE_LENGTH,
  ): number {
    return ruleMaxLength - (
      usernames.reduce((pv, cv) => pv + cv.length, 0)
      + (usernames.length + 1) * 5// `from:` length
      + usernames.length * 4 // ` OR ` length
    )
  }

  /**
   * Build rules by usernames while trying to fit as many username as possible into 1 rule
   */
  public static buildStreamRulesByUsernames(
    usernames: string[],
    ruleMaxLength = TWITTER_STREAM_RULE_LENGTH,
  ): string[] {
    /**
     * Length of ` OR from:X`
     */
    const minUserRuleThreshold = 10
    const arr1: string[] = Array.from(usernames)
      .filter((v) => v)
      .sort((a, b) => b.length - a.length || a.toLowerCase().localeCompare(b.toLowerCase()))
    const arr2: string[] = []
    const arrResult: string[][] = []

    while (arr1.length) {
      arr2.push(arr1.shift())
      const ruleLength = this.calcRuleLength(arr2)
      if (ruleLength + minUserRuleThreshold > ruleMaxLength) {
        arr1.unshift(arr2.pop())
        const ruleRemainLength = this.calcRuleRemainLength(arr2)
        const index = arr1.findIndex((v) => v.length <= ruleRemainLength)
        if (index >= 0) {
          const username = arr1.splice(index, 1)[0]
          arr2.push(username)
          arrResult.push(Array.from(arr2))
          arr2.length = 0
        }
        // eslint-disable-next-line no-continue
        continue
      }
      if (!arr1.length) {
        arrResult.push(Array.from(arr2))
      }
    }

    const rules = arrResult.map((result) => result.map((v) => `from:${v}`).join(' OR '))
    return rules
  }
}

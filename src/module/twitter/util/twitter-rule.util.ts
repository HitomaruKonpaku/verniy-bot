/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */

import { TWITTER_STREAM_RULE_LENGTH } from '../constant/twitter.constant'

export class TwitterRuleUtil {
  private static readonly OPERATORS = {
    from: 'from:',
    or: ' OR ',
  }

  public static buildStreamRulesByUsernames(
    usernames: string[],
    ruleMaxLength = TWITTER_STREAM_RULE_LENGTH,
  ): string[] {
    if (!usernames?.length) {
      return []
    }

    // Ensure valid input
    usernames = usernames.slice()
    ruleMaxLength = Math.max(0, ruleMaxLength)

    // Transform to number array
    const lengths = usernames.map((v) => v.length)
    const lengthChunks: number[][] = []

    // Generate array with max possible amount of user in single rule
    while (lengths.length && ruleMaxLength > 0) {
      const result = this.howSum(ruleMaxLength, lengths)
      if (result) {
        // Save current result
        lengthChunks.push(result)
        // Remove result from origin array
        result.forEach((v) => lengths.splice(lengths.indexOf(v), 1))
      } else {
        // Reduce rule max length to find best fit for single rule
        ruleMaxLength--
      }
    }

    // Transform number array back to username array
    const usernameChunks = lengthChunks.map((chunk) => {
      const usernameChunk = chunk.map((length) => {
        const index = usernames.findIndex((v) => v.length === length)
        const username = usernames.splice(index, 1)[0]
        return username
      })
      return usernameChunk
    })

    // Build rules
    const rules = usernameChunks.map((chunk) => chunk.map((v) => this.OPERATORS.from + v).join(this.OPERATORS.or))

    // console.debug(usernameChunks)
    // console.debug(usernameChunks.reduce((pv, cv) => pv + cv.length, 0))
    // debugger

    return rules
  }

  /**
   * howSum memoization
   *
   * @see https://www.youtube.com/watch?v=oBt53YbR9Kk&t=5369s
   */
  private static howSum(
    targetSum: number,
    numbers: number[],
    memo: Record<number, number[]> = {},
    stack = 0,
  ) {
    if (targetSum in memo) return memo[targetSum]
    if (targetSum === 0) return []
    if (targetSum < 0) return null

    numbers = numbers.slice()

    for (let i = 0; i < numbers.length; i++) {
      const curNumber = numbers[i]
      const remainNumbers = numbers.filter((_, j) => j > i)
      const remainder = targetSum - curNumber - this.OPERATORS.from.length - (stack ? this.OPERATORS.or.length : 0)
      const remainderResult = this.howSum(remainder, remainNumbers, memo, stack + 1)
      if (remainderResult !== null) {
        memo[targetSum] = [curNumber, ...remainderResult]
        return memo[targetSum]
      }
    }

    memo[targetSum] = null
    return memo[targetSum]
  }
}

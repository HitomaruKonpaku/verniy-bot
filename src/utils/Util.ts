import { readFileSync } from 'fs'
import path from 'path'
import { logger as baseLogger } from '../logger'

const logger = baseLogger.child({ label: '[Util]' })

export class Util {
  public static getConfig() {
    const config: Record<string, any> = {}
    try {
      Object.assign(
        config,
        JSON.parse(readFileSync(
          path.join('config.json'),
          'utf-8',
        )),
      )
    } catch (error) {
      logger.error(error)
    }
    return config
  }

  public static splitArrayIntoChunk<T>(arr: T[], chunkSize: number) {
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }
}

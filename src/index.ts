import 'dotenv/config'
import { logger } from './logger'
import { configManager } from './modules/config/ConfigManager'
import { db } from './modules/database/Database'
import { discord } from './modules/discord/Discord'

logger.info(Array(80).fill('=').join(''))

async function main() {
  try {
    configManager.load()
    await db.init()
    await discord.start()
  } catch (error) {
    logger.error(error.message)
  }
}

main()

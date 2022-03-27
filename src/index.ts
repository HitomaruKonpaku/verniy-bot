import 'dotenv/config'
import { discord } from './clients/discord'
import { logger } from './logger'

logger.info(Array(80).fill('=').join(''))
discord.start()

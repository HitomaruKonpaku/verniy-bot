import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { LOGGER_DATE_PATTERN, LOGGER_DIR } from './constants/logger.constant'

function getPrintFormat() {
  return format.printf((info) => {
    const content = [
      info.timestamp,
      [
        `[${info.level}]`,
        info.context ? `[${info.context}]` : '',
        info.message,
      ].filter((v) => v).join(' '),
      Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : '',
    ].filter((v) => v).join(' | ')
    return content
  })
}

function getFileName() {
  return `${process.env.NODE_ENV || 'dev'}.%DATE%`
}

const consoleTransport = new winston.transports.Console({
  level: 'info',
  format: format.combine(
    format.colorize(),
    getPrintFormat(),
  ),
})

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
    format((info) => Object.assign(info, { level: info.level.toUpperCase() }))(),
    format((info) => {
      const { metadata } = info
      if (metadata.context) {
        Object.assign(info, { context: metadata.context })
        delete metadata.context
      }
      return info
    })(),
  ),
  transports: [
    consoleTransport,
    new DailyRotateFile({
      level: 'verbose',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}.log`,
    }),
    new DailyRotateFile({
      level: 'error',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}_error.log`,
    }),
    new DailyRotateFile({
      level: 'silly',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}_all.log`,
    }),
  ],
})

function toggleDebugConsole() {
  consoleTransport.level = 'debug'
}

export {
  logger,
  logger as baseLogger,
  toggleDebugConsole,
}

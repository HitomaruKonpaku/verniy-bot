import { Logger } from '@nestjs/common'

export class AppLogger extends Logger {
  error(message: any, trace?: string, context?: string): void {
    const level = 'error'
    const msg =
      [
        this.getMessage(level, message, context),
        trace,
      ].filter(v => v).join('\n')
    console.log(msg)
  }

  warn(message: any, context?: string): void {
    const level = 'warn'
    const msg = this.getMessage(level, message, context)
    console.log(msg)
  }

  log(message: any, context?: string): void {
    const level = 'log'
    const msg = this.getMessage(level, message, context)
    console.log(msg)
  }

  debug(message: any, context?: string): void {
    const level = 'debug'
    const msg = this.getMessage(level, message, context)
    console.log(msg)
  }

  private getMessage(level: string, message: any, context?: string) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    const time = date.toISOString().replace(/[TZ]/g, ' ').trim()
    const lvl = this.getLevel(level)
    const msg = [
      [
        time,
        lvl,
        context,
      ].filter(v => v).map(v => `[${v}]`).join(''),
      message,
    ].join(' ')
    return msg
  }

  private getLevel(level: string) {
    const s = level.toUpperCase().padEnd(5, ' ')
    return s
  }
}

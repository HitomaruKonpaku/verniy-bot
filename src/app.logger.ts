import { Logger } from '@nestjs/common'

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  LOG = 'LOG',
  DEBUG = 'DEBUG',
}

export class AppLogger extends Logger {
  private readonly _logs: string[] = []

  public get logs(): string[] {
    return [...this._logs]
  }

  private get isProd(): boolean {
    const env = process.env.NODE_ENV
    const isProd = env === 'production'
    return isProd
  }

  private get isDev(): boolean {
    const isDev = !this.isProd
    return isDev
  }

  error(message: any, trace?: string, context?: string): void {
    const level = LogLevel.ERROR
    const msg =
      [
        this.getMessage(level, message, context),
        trace,
      ].filter(v => v).join('\n')
    this._logs.push(msg)
    console.log(msg)
  }

  warn(message: any, context?: string): void {
    const level = LogLevel.WARN
    const msg = this.getMessage(level, message, context)
    this._logs.push(msg)
    console.log(msg)
  }

  log(message: any, context?: string): void {
    const level = LogLevel.LOG
    const msg = this.getMessage(level, message, context)
    this._logs.push(msg)
    console.log(msg)
  }

  debug(message: any, context?: string): void {
    const level = LogLevel.LOG
    const msg = this.getMessage(level, message, context)
    this._logs.push(msg)
    console.log(msg)
  }

  private getMessage(level: string, message: any, context?: string) {
    const time = this.isDev ? this.getTime() : null
    const lvl = this.getLevel(level)
    const msg = [
      [time, lvl, context].filter(v => v).map(v => `[${v}]`).join(''),
      message,
    ].join(' ')
    return msg
  }

  private getTime(): string {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    const time = date.toISOString().replace(/[TZ]/g, ' ').trim()
    return time
  }

  private getLevel(level: string): string {
    const s = level.toUpperCase().padEnd(5, ' ')
    return s
  }
}

import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'

@Injectable()
export class EnvironmentService {
  public get isProd(): boolean {
    const nodeEnv = this.getValue('NODE_ENV').toLowerCase()
    const isProd = nodeEnv === 'production'
    return isProd
  }

  public get isDev(): boolean {
    const isDev = !this.isProd
    return isDev
  }

  constructor() {
    dotenv.config()
  }

  public getValue(key: string): string {
    const value = String(process.env[key])
    return value
  }

  public getBoolean(key: string): boolean {
    const value = this.getValue(key)
    const boolValues = ['true', '1']
    const isBool = boolValues.some(v => v === value)
    return isBool
  }

  public getNumber(key: string): number {
    const value = this.getValue(key)
    const numb = Number(value)
    return numb
  }
}

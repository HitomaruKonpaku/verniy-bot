import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'

@Injectable()
export class EnvironmentService {
  public get isProd(): boolean {
    const nodeEnv = this.getValue('NODE_ENV')?.toLowerCase()
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
    const value = process.env[key]
    return value
  }

  public getBoolean(key: string): boolean {
    const booleanTrueValues = ['true', '1', 1]
    const value = this.getValue(key)
    const booleanValue = booleanTrueValues.some(v => v === value)
    return booleanValue
  }

  public getNumber(key: string): number {
    const value = this.getValue(key)
    const numberValue = Number(value)
    return numberValue
  }
}

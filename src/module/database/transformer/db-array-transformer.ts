import { ValueTransformer } from 'typeorm'

export const dbArrayTransformer: ValueTransformer = {
  to: (value: any[]) => {
    const data = Array.isArray(value)
      ? JSON.stringify(value)
      : null
    return data
  },
  from: (value: string) => {
    const data = JSON.parse(value)
    return data
  },
}

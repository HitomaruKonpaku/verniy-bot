import { ValueTransformer } from 'typeorm'

export const dbObjectTransformer: ValueTransformer = {
  to: (value: any) => {
    const data = typeof value === 'object'
      ? JSON.stringify(value)
      : null
    return data
  },
  from: (value: string) => {
    const data = JSON.parse(value)
    return data
  },
}

import { ValueTransformer } from 'typeorm'

export const dbObjectTransformer: ValueTransformer = {
  to: (value: any) => {
    if (value && typeof value === 'object') {
      const data = JSON.stringify(value)
      return data
    }
    return null
  },
  from: (value: string) => {
    const data = JSON.parse(value)
    return data
  },
}

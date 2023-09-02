import { ValueTransformer } from 'typeorm'

export const dbArrayTransformer: ValueTransformer = {
  to: (value: any[]) => {
    if (Array.isArray(value)) {
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

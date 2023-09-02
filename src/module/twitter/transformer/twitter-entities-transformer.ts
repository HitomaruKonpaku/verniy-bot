import { ValueTransformer } from 'typeorm'

const replacer = (key, value) => {
  if (Array.isArray(value) && !value.length) {
    return undefined
  }
  return value
}

export const twitterEntitiesTransformer: ValueTransformer = {
  to: (value: any) => {
    if (value && typeof value === 'object') {
      const data = JSON.stringify(value, replacer)
      return data
    }
    return null
  },
  from: (value: string) => {
    const data = JSON.parse(value)
    return data
  },
}

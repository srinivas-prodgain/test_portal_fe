import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000/api/v1'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

export const env = parseEnv()

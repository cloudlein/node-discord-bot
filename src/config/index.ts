import 'dotenv/config'
import z from 'zod'

const discordTokenRegex = /^[A-Za-z0-9_-]{24,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,38}$/;
const supabaseKeyRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const sheetsIdRegex = /^[a-zA-Z0-9-_]{44}$/
const discordSnowflakeRegex = /^\d{17,19}$/

const applicationEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info")
})

const discordEnvSchema = z.object({
  DISCORD_TOKEN: z.string().min(1).regex(discordTokenRegex),
  DISCORD_CLIENT_ID: z.string().regex(discordSnowflakeRegex),
  DISCORD_GUILD_ID: z.string().regex(discordSnowflakeRegex),
})

const supabaseEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1).regex(supabaseKeyRegex),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).regex(supabaseKeyRegex),
})

const googleSheetsSchema = z.object({
  GOOGLE_SHEET_ID: z.string().regex(sheetsIdRegex),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().refine((val) => val.includes("-----BEGIN PRIVATE KEY-----") && val.includes("-----END PRIVATE KEY-----"), { message: "Invalid format private key Google Service account" })
})

const apiSecurityEnvSchema = z.object({
  API_SECRET_KEY: z.string().min(32),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1).max(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).max(100)
})

const redisEnvSchema = z.object({
  REDIS_URL: z.string().regex(/^rediss?:\/\/.+/),
})

const newsSourceEnvSchema = z.object({
  NEWS_RSS_FEEDS: z.string().url(),
  NEWS_POLL_INTERVAL_MINUTES: z.coerce.number().int().min(1).max(15).default(15)
})

export const envSchema = applicationEnvSchema
  .merge(discordEnvSchema)
  .merge(supabaseEnvSchema)
  .merge(googleSheetsSchema)
  .merge(apiSecurityEnvSchema)
  .merge(redisEnvSchema)
  .merge(newsSourceEnvSchema)

export type Config = z.infer<typeof envSchema>

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2))
  throw new Error("Invalid environment configuration")
}

export const Config: Config = parsedEnv.data

export default Config
export {
  applicationEnvSchema,
  discordEnvSchema,
  supabaseEnvSchema,
  googleSheetsSchema,
  apiSecurityEnvSchema,
  redisEnvSchema,
  newsSourceEnvSchema
}

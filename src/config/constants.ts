export enum SocialMediaPlatform {
  DISCORD = 'discord',
  X = 'x',
  INSTAGRAM = 'instagram',
  REDDIT = 'reddit'
}

export enum PublicationStatus {
  DRAFT = 'draft',
  READY = 'ready',
  PUBLISHED = 'published',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export enum FeedbackCategory {
  CRITIQUE = 'critique',
  SUGGESTION = 'suggestion',
  BUG = 'bug',
  FEEDBACK = 'feadback',
  COMPLAINT = 'complaint'
}

export const DEFAULT_RATE_LIMIT = {
  WINDOW_MS: 60_000,
  MAX_REQUESTS: 100
} as const


export const DEFAULT_RETRY_POLICY = {
  MAX_RETRIES: 3,
  BACKOFF_DELAY_MS: 1_000,
  MAX_BACKOFF_DELAY_MS: 30_000
} as const

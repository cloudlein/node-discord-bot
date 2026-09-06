export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface News {
  id: string;
  game_id: string;
  title: string;
  content: string;
  external_id: string | null;
  status: 'draft' | 'ready' | 'published' | 'archived';
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NewsPublication {
  id: string;
  news_id: string;
  platform: 'discord' | 'instagram' | 'x' | 'reddit';
  channel_id: string | null;
  external_post_id: string | null;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  error_message: string | null;
  retry_count: number;
  published_at: string | null;
}

export interface Feedback {
  id: string;
  user_id: string;
  username: string;
  game_id: string | null;
  category: 'critique' | 'suggestion' | 'bug' | 'feedback' | 'complaint';
  message: string;
  status: 'new' | 'reviewed' | 'resolved' | 'archived';
  synced_to_sheets: boolean;
  created_at: string;
}

export interface ModerationLog {
  id: string;
  user_id: string;
  message_id: string | null;
  guild_id: string;
  action: 'delete' | 'warn' | 'timeout' | 'ban' | 'log' | 'escalate';
  provider: 'rule_based' | 'openai' | 'perspective';
  confidence: number | null;
  is_media: boolean;
  created_at: string;
}

export interface GuildConfig {
  id: string;
  guild_id: string;
  mod_log_channel_id: string | null;
  feedback_channel_id: string | null;
  default_news_channel_id: string | null;
  moderation_enabled: boolean;
  ai_moderation_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChannelMapping {
  id: string;
  guild_id: string;
  game_id: string;
  channel_id: string;
  purpose: 'news' | 'feedback' | 'general';
  is_active: boolean;
  created_at: string;
}

export interface PlatformConfig {
  id: string;
  platform: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
  rate_limit_per_hour: number;
  created_at: string;
  updated_at: string;
}

export interface BadWord {
  id: string;
  word: string;
  category: 'profanity' | 'slur' | 'spam' | 'harassment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_regex: boolean;
  is_active: boolean;
  language: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  discord_id: string;
  username: string;
  api_key_hash: string;
  role: 'superadmin' | 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
}

export interface ScheduledNews {
  id: string;
  news_id: string;
  scheduled_at: string;
  target_platforms: ('discord' | 'instagram' | 'x' | 'reddit')[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface RetryJob {
  id: string;
  job_type: 'publish' | 'sheets_sync' | 'news_fetch';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead';
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

// Aliases
export type Games = Game;
export type NewsPublications = NewsPublication;
export type Feedbacks = Feedback;
export type ModerationLogs = ModerationLog;
export type GuildConfigs = GuildConfig;
export type ChannelMappings = ChannelMapping;
export type PlatformConfigs = PlatformConfig;
export type BadWords = BadWord;
export type AdminUsers = AdminUser;
export type RetryJobs = RetryJob;

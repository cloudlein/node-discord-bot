CREATE TABLE guild_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id VARCHAR(100) NOT NULL UNIQUE,
    mod_log_channel_id VARCHAR(100),
    feedback_channel_id VARCHAR(100),
    default_news_channel_id VARCHAR(100),
    moderation_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_moderation_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE guild_configs ENABLE ROW LEVEL SECURITY;

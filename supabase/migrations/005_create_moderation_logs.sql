CREATE TABLE moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    message_id VARCHAR(100),
    guild_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('delete', 'warn', 'timeout', 'ban', 'log', 'escalate')),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('rule_based', 'openai', 'perspective')),
    confidence DECIMAL(5, 4),
    is_media BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_logs_user_id ON moderation_logs (user_id);
CREATE INDEX idx_moderation_logs_guild_id ON moderation_logs (guild_id);
CREATE INDEX idx_moderation_logs_created_at ON moderation_logs (created_at);

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

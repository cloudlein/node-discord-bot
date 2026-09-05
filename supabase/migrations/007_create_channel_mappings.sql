CREATE TABLE channel_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id VARCHAR(100) NOT NULL,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    channel_id VARCHAR(100) NOT NULL,
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('news', 'feedback', 'general')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_guild_game_purpose UNIQUE (guild_id, game_id, purpose)
);

CREATE INDEX idx_channel_mappings_guild_id ON channel_mappings (guild_id);
CREATE INDEX idx_channel_mappings_game_id ON channel_mappings (game_id);

ALTER TABLE channel_mappings ENABLE ROW LEVEL SECURITY;

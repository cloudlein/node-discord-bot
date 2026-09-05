CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    external_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published', 'archived')),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_game_id ON news (game_id);
CREATE INDEX idx_news_status ON news (status);
CREATE INDEX idx_news_scheduled_at ON news (scheduled_at);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

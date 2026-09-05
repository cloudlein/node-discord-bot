CREATE TABLE scheduled_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL UNIQUE REFERENCES news(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    target_platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_news_scheduled_at ON scheduled_news (scheduled_at);
CREATE INDEX idx_scheduled_news_status ON scheduled_news (status);

ALTER TABLE scheduled_news ENABLE ROW LEVEL SECURITY;

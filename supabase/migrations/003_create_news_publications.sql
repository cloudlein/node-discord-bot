CREATE TABLE news_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('discord', 'instagram', 'x', 'reddit')),
    channel_id VARCHAR(255),
    external_post_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_news_publications_news_id ON news_publications (news_id);
CREATE INDEX idx_news_publications_platform ON news_publications (platform);
CREATE INDEX idx_news_publications_status ON news_publications (status);

ALTER TABLE news_publications ENABLE ROW LEVEL SECURITY;

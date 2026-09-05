CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'editor' CHECK (role IN ('superadmin', 'admin', 'editor')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_api_key_hash ON admin_users (api_key_hash);

ALTER TABLE news ADD CONSTRAINT fk_news_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

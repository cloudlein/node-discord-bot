CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    username VARCHAR(255) NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('kritik', 'saran', 'bug', 'feedback', 'complaint')),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
    synced_to_sheets BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_user_id ON feedback (user_id);
CREATE INDEX idx_feedback_game_id ON feedback (game_id);
CREATE INDEX idx_feedback_category ON feedback (category);
CREATE INDEX idx_feedback_status ON feedback (status);
CREATE INDEX idx_feedback_synced_to_sheets ON feedback (synced_to_sheets);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

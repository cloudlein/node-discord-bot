CREATE TABLE bad_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('profanity', 'slur', 'spam', 'harassment')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_regex BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    language VARCHAR(10) NOT NULL DEFAULT 'id',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_bad_words_word_lang UNIQUE (word, language)
);

CREATE INDEX idx_bad_words_is_active ON bad_words (is_active);

ALTER TABLE bad_words ENABLE ROW LEVEL SECURITY;

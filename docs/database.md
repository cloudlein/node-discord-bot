# Database Architecture & Schema

This document provides complete documentation of the PostgreSQL database hosted on Supabase, including entity relationships, table specifications, and security policies.

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    games ||--o{ news : "has many"
    games ||--o{ channel_mappings : "mapped to"
    games ||--o{ feedback : "related to"
    news ||--o{ news_publications : "published to"
    news ||--o| scheduled_news : "optionally scheduled"
    admin_users ||--o{ news : "creates"
    guild_configs ||--o{ channel_mappings : "configures"

    games {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        boolean is_active
        timestamptz created_at
    }

    news {
        uuid id PK
        uuid game_id FK
        varchar title
        text content
        varchar external_id UK
        varchar status "draft/ready/published/archived"
        timestamptz scheduled_at
        timestamptz published_at
        uuid created_by FK
        timestamptz created_at
    }

    news_publications {
        uuid id PK
        uuid news_id FK
        varchar platform "discord/instagram/x/reddit"
        varchar channel_id
        varchar external_post_id
        varchar status "pending/success/failed/retrying"
        text error_message
        integer retry_count
        timestamptz published_at
    }

    feedback {
        uuid id PK
        varchar user_id "Discord snowflake"
        varchar username
        uuid game_id FK
        varchar category "kritik/saran/bug/feedback/complaint"
        text message
        varchar status "new/reviewed/resolved/archived"
        boolean synced_to_sheets
        timestamptz created_at
    }

    moderation_logs {
        uuid id PK
        varchar user_id
        varchar message_id
        varchar guild_id
        varchar action "delete/warn/timeout/ban/log/escalate"
        varchar provider "rule_based/openai/perspective"
        decimal confidence
        boolean is_media
        timestamptz created_at
    }

    guild_configs {
        uuid id PK
        varchar guild_id UK
        varchar mod_log_channel_id
        varchar feedback_channel_id
        varchar default_news_channel_id
        boolean moderation_enabled
        boolean ai_moderation_enabled
    }

    channel_mappings {
        uuid id PK
        varchar guild_id
        uuid game_id FK
        varchar channel_id
        varchar purpose "news/feedback/general"
        boolean is_active
    }

    platform_configs {
        uuid id PK
        varchar platform UK
        boolean is_enabled
        jsonb config
        integer rate_limit_per_hour
    }

    bad_words {
        uuid id PK
        varchar word
        varchar category "profanity/slur/spam/harassment"
        varchar severity "low/medium/high/critical"
        boolean is_regex
        boolean is_active
        varchar language
    }

    admin_users {
        uuid id PK
        varchar discord_id UK
        varchar username
        varchar api_key_hash
        varchar role "superadmin/admin/editor"
        boolean is_active
    }

    scheduled_news {
        uuid id PK
        uuid news_id FK
        timestamptz scheduled_at
        jsonb target_platforms
        varchar status "pending/processing/completed/failed"
    }

    retry_jobs {
        uuid id PK
        varchar job_type "publish/sheets_sync/news_fetch"
        jsonb payload
        varchar status "pending/processing/completed/failed/dead"
        integer retry_count
        integer max_retries
        timestamptz next_retry_at
        text last_error
    }
```

---

## Table Details

### 1. Core Tables

| Table | Purpose | Key Columns | Key Indexes |
|---|---|---|---|
| `games` | Game catalog registry | `id`, `name`, `slug`, `is_active` | `slug` (unique) |
| `news` | News articles with draft/publish status | `id`, `game_id`, `title`, `content`, `external_id`, `status` | `game_id`, `external_id` (unique, dedup), `status`, `scheduled_at` |
| `news_publications` | Per-platform publication status | `id`, `news_id`, `platform`, `status`, `retry_count` | `news_id`, `platform`, `status` |
| `feedback` | User feedback across 5 categories | `id`, `user_id`, `category`, `message`, `status`, `synced_to_sheets` | `user_id`, `game_id`, `category`, `status`, `synced_to_sheets` |
| `moderation_logs` | Audit trail for moderation actions | `id`, `user_id`, `guild_id`, `action`, `confidence` | `user_id`, `guild_id`, `created_at` |

### 2. Configuration Tables

| Table | Purpose | Key Columns | Key Indexes |
|---|---|---|---|
| `guild_configs` | Per-guild bot configuration | `id`, `guild_id`, `mod_log_channel_id`, `moderation_enabled` | `guild_id` (unique) |
| `channel_mappings` | Map games to Discord channels | `id`, `guild_id`, `game_id`, `channel_id`, `purpose` | `(guild_id, game_id, purpose)` unique |
| `platform_configs` | Social platform settings and rate limits | `id`, `platform`, `is_enabled`, `config`, `rate_limit_per_hour` | `platform` (unique) |
| `bad_words` | Prohibited words and regex patterns | `id`, `word`, `category`, `severity`, `is_regex`, `is_active` | `(word, language)` unique, `is_active` |
| `admin_users` | REST API credentials & RBAC | `id`, `discord_id`, `api_key_hash`, `role`, `is_active` | `discord_id` (unique), `api_key_hash` |

### 3. Background Job Tables

| Table | Purpose | Key Columns | Key Indexes |
|---|---|---|---|
| `scheduled_news` | Queued timed news publications | `id`, `news_id`, `scheduled_at`, `status` | `news_id` (unique), `scheduled_at`, `status` |
| `retry_jobs` | Queue for failed operations | `id`, `job_type`, `payload`, `status`, `next_retry_at` | `job_type`, `status`, `next_retry_at` |

---

## Row Level Security (RLS)

All tables use the Supabase `service_role` key with default-deny RLS policies:

```sql
-- Example: Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE retry_jobs ENABLE ROW LEVEL SECURITY;

-- Default deny: No access via anon key
-- All bot and API operations authenticate using the backend service_role key
```

> **Security Note:** This is a server-side bot application. Supabase queries run on the backend using the `SUPABASE_SERVICE_ROLE_KEY`. RLS default-deny provides defense-in-depth in case the anonymous key is ever exposed.

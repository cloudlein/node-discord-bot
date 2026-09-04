# Security & Privacy Guidelines

This document details security implementations across environments, REST endpoints, Discord gateways, and database policies.

---

## Secrets & Environment Security

- Secrets (`DISCORD_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, API keys) must reside exclusively in `.env`.
- `.env` is committed to `.gitignore` and never checked into source control.
- Configuration is strictly validated at application startup using Zod schemas; missing keys fail fast.
- The Winston logger automatically redacts variables and request parameters matching regex pattern `/(token|key|secret|password|authorization)/i`.

---

## API Layer Security

- **Authentication**: Bearer API tokens verified against hashed entries (`admin_users.api_key_hash`).
- **Authorization**: Granular role-based access controls (`superadmin`, `admin`, `editor`).
- **Input Validation**: Request bodies, query parameters, and URL slugs are validated via Zod schemas before reaching service logic.
- **Rate Limiting**: Sliding window rate limits per IP and API key.
- **HTTP Headers**: Enforced security headers (`Helmet`), CORS origin restriction, and strict MIME types.
- **SQL Injection Prevention**: Supabase client uses parameterized queries exclusively.

---

## Discord Platform Security

- **Intent Minimization**: Only required intents (`Message Content`, `Server Members`) are requested.
- **Permissions**: Bot verifies both bot permissions and caller execution permissions before invoking admin slash commands.
- **Webhook Signatures**: Webhooks and external integrations validate cryptographically signed payload signatures.

---

## Data Privacy & Row Level Security

- **Supabase RLS**: Enabled with default-deny policies on all 12 tables.
- **Service Role Execution**: Queries run purely on backend servers with no exposure of client-side credentials.
- **Data Minimization**: Personal identifiable information (PII) like phone numbers or personal emails is never recorded.

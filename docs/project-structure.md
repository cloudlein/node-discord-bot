# Project Directory Structure

This document provides a comprehensive breakdown of the file organization, directory roles, and module boundaries in the Game Community Bot repository.

---

## Directory Tree

```
node-discord-bot/
├── src/
│   ├── index.ts                                    # Entry point - bootstrap bot + API
│   ├── bot.ts                                      # Discord client setup & event loading
│   ├── server.ts                                   # Express REST API server setup
│   │
│   ├── config/
│   │   ├── index.ts                                # Validated config from env (Zod schema)
│   │   ├── constants.ts                            # App-wide constants & enums
│   │   └── database.ts                             # Supabase client singleton
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── index.ts                            # Barrel exports for all types
│   │   │   ├── common.ts                           # Shared enums, pagination, result types
│   │   │   ├── news.ts                             # News entity, DTO, query types
│   │   │   ├── feedback.ts                         # Feedback entity & DTO types
│   │   │   ├── moderation.ts                       # Moderation decision, action types
│   │   │   ├── game.ts                             # Game entity & DTO types
│   │   │   ├── publishing.ts                       # PublishResult, platform types
│   │   │   └── database.ts                         # Supabase auto-generated row types
│   │   │
│   │   ├── errors/
│   │   │   ├── index.ts                            # Barrel exports
│   │   │   ├── base.error.ts                       # AppError base class with code & status
│   │   │   ├── validation.error.ts                 # Input validation failures
│   │   │   ├── authentication.error.ts             # Auth token/key failures
│   │   │   ├── authorization.error.ts              # Permission denied
│   │   │   ├── integration.error.ts                # External service failures
│   │   │   ├── database.error.ts                   # Supabase query failures
│   │   │   ├── publishing.error.ts                 # Platform publish failures
│   │   │   └── moderation.error.ts                 # Moderation processing failures
│   │   │
│   │   ├── interfaces/
│   │   │   ├── publisher.interface.ts              # SocialPublisher port (publish/validate)
│   │   │   ├── moderation-provider.interface.ts    # ModerationProvider port (check/analyze)
│   │   │   ├── queue.interface.ts                  # JobQueue port (enqueue/process)
│   │   │   └── news-source.interface.ts            # NewsSource port (fetch/parse)
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts                           # Winston structured logger with context
│   │   │   ├── retry.ts                            # Generic retry with exponential backoff
│   │   │   ├── rate-limiter.ts                     # Token bucket rate limiter
│   │   │   ├── id-generator.ts                     # Correlation ID & request ID generator
│   │   │   └── sanitizer.ts                        # Input sanitization & redaction
│   │   │
│   │   └── middleware/
│   │       ├── error-handler.middleware.ts          # Express global error handler
│   │       ├── auth.middleware.ts                   # API key / JWT verification
│   │       ├── rate-limit.middleware.ts             # Per-route rate limiting
│   │       ├── validation.middleware.ts             # Zod-based request validation
│   │       └── logging.middleware.ts                # Request/response structured logging
│   │
│   ├── modules/
│   │   ├── games/
│   │   │   ├── game.service.ts                     # Game CRUD business logic
│   │   │   ├── game.repository.ts                  # Supabase games table operations
│   │   │   └── game.validator.ts                   # Zod schemas for game input
│   │   │
│   │   ├── news/
│   │   │   ├── news.service.ts                     # Core: create draft, deduplicate, update status
│   │   │   ├── news.repository.ts                  # Supabase news table operations
│   │   │   ├── news.validator.ts                   # Zod schemas for news input
│   │   │   ├── news-source/
│   │   │   │   ├── news-source.service.ts          # Orchestrate multi-source fetching
│   │   │   │   ├── rss-source.adapter.ts           # RSS feed parser adapter
│   │   │   │   └── api-source.adapter.ts           # REST API source adapter
│   │   │   └── news-scheduler/
│   │   │       └── news-scheduler.service.ts       # Scheduling logic for timed publishing
│   │   │
│   │   ├── publishing/
│   │   │   ├── publishing.service.ts               # Core publish orchestration (fan-out)
│   │   │   ├── publication.repository.ts           # Supabase news_publications operations
│   │   │   ├── publisher.registry.ts               # Register, enable/disable publishers
│   │   │   └── publishers/
│   │   │       ├── discord.publisher.ts            # Discord channel embed publisher
│   │   │       ├── instagram.publisher.ts          # Instagram Graph API publisher
│   │   │       ├── x.publisher.ts                  # X/Twitter API v2 publisher
│   │   │       └── reddit.publisher.ts             # Reddit API publisher (optional)
│   │   │
│   │   ├── feedback/
│   │   │   ├── feedback.service.ts                 # Feedback CRUD & categorization logic
│   │   │   ├── feedback.repository.ts              # Supabase feedback table operations
│   │   │   └── feedback.validator.ts               # Zod schemas for feedback input
│   │   │
│   │   ├── moderation/
│   │   │   ├── moderation.service.ts               # Orchestrate hybrid moderation flow
│   │   │   ├── moderation.repository.ts            # Supabase moderation_logs operations
│   │   │   ├── moderation.registry.ts              # Register & chain moderation providers
│   │   │   └── providers/
│   │   │       ├── rule-based.provider.ts          # Regex + wordlist + pattern matching
│   │   │       ├── openai.provider.ts              # OpenAI moderation endpoint
│   │   │       └── perspective.provider.ts         # Google Perspective API (optional)
│   │   │
│   │   └── guild-config/
│   │       ├── guild-config.service.ts             # Guild settings management
│   │       └── guild-config.repository.ts          # Supabase guild_configs & channel_mappings
│   │
│   ├── integrations/
│   │   ├── discord/
│   │   │   ├── client.ts                           # Discord.js Client factory & intents
│   │   │   ├── events/
│   │   │   │   ├── index.ts                        # Event loader & registration
│   │   │   │   ├── ready.ts                        # Bot ready - log status, init caches
│   │   │   │   ├── interaction-create.ts           # Route slash commands to handlers
│   │   │   │   ├── message-create.ts               # Moderation hook for every message
│   │   │   │   └── guild-create.ts                 # Auto-setup when joining new guild
│   │   │   ├── commands/
│   │   │   │   ├── index.ts                        # Command registry & dynamic loader
│   │   │   │   ├── deploy.ts                       # Register commands with Discord API
│   │   │   │   ├── news.command.ts                 # /news, /news publish, /news list
│   │   │   │   ├── feedback.command.ts             # /feedback (modal-based form)
│   │   │   │   ├── report.command.ts               # /report (bug report shortcut)
│   │   │   │   ├── config.command.ts               # /config (admin guild settings)
│   │   │   │   ├── moderation.command.ts           # /moderation stats, /moderation manage
│   │   │   │   └── help.command.ts                 # /help
│   │   │   ├── embeds/
│   │   │   │   ├── news.embed.ts                   # Rich embed for news announcements
│   │   │   │   ├── feedback.embed.ts               # Feedback confirmation & summary
│   │   │   │   └── moderation.embed.ts             # Moderation action notifications
│   │   │   └── utils/
│   │   │       ├── permissions.ts                  # Discord permission check helpers
│   │   │       └── interaction-helpers.ts          # Defer, reply, error response helpers
│   │   │
│   │   ├── google-sheets/
│   │   │   ├── client.ts                           # Google Sheets auth (service account)
│   │   │   └── sheets.service.ts                   # Append feedback rows, read data
│   │   │
│   │   ├── ai/
│   │   │   ├── client.ts                           # AI provider client factory
│   │   │   └── ai.service.ts                       # Unified AI interface (moderation/analysis)
│   │   │
│   │   └── social/
│   │       ├── instagram/
│   │       │   └── instagram.client.ts             # Instagram Graph API HTTP client
│   │       ├── x/
│   │       │   └── x.client.ts                     # X/Twitter API v2 HTTP client
│   │       └── reddit/
│   │           └── reddit.client.ts                # Reddit API HTTP client
│   │
│   ├── api/
│   │   ├── index.ts                                # Express app factory with middleware
│   │   ├── router.ts                               # /api/v1 router - mount all routes
│   │   └── routes/
│   │       ├── news.routes.ts                      # News CRUD + publish endpoints
│   │       ├── feedback.routes.ts                  # Feedback CRUD endpoints
│   │       ├── games.routes.ts                     # Games CRUD endpoints
│   │       ├── platforms.routes.ts                 # Platform config endpoints
│   │       └── health.routes.ts                    # Health check endpoint
│   │
│   └── jobs/
│       ├── index.ts                                # Job scheduler bootstrap & registration
│       ├── queue/
│       │   ├── memory-queue.ts                     # In-memory queue (default, no Redis)
│       │   └── bull-queue.ts                       # BullMQ adapter (optional, needs Redis)
│       ├── workers/
│       │   ├── news-fetch.worker.ts                # Periodic news source polling
│       │   ├── news-publish.worker.ts              # Async multi-platform publishing
│       │   ├── feedback-sync.worker.ts             # Google Sheets sync with retry
│       │   ├── scheduled-news.worker.ts            # Process scheduled news at their time
│       │   └── retry.worker.ts                     # Process failed retry_jobs
│       └── scheduler/
│           └── cron-scheduler.ts                   # node-cron wrapper for periodic jobs
│
├── tests/
│   ├── unit/                                       # Unit tests
│   ├── integration/                                # Integration tests
│   ├── e2e/                                        # End-to-end tests
│   ├── mocks/                                      # External service mocks
│   └── helpers/                                    # Test helpers & factories
│
├── supabase/
│   └── migrations/                                 # 001 to 012 SQL migration scripts
│
├── docs/                                           # Dedicated documentation files
├── scripts/                                        # Utility and operational scripts
└── package.json                                    # Dependencies and scripts
```

---

## Directory Roles

| Folder | Layer | Responsibility |
|---|---|---|
| `src/config/` | Foundation | Environment validation via Zod, application constants, and Supabase client singleton. |
| `src/shared/` | Cross-Cutting | Domain interfaces (ports), custom error classes, shared TypeScript types, middleware, and utilities. |
| `src/modules/` | Domain / App | Core business logic decoupled from any SDK. Modules: `games`, `news`, `publishing`, `feedback`, `moderation`, `guild-config`. |
| `src/integrations/` | Infrastructure | Adapters for third-party systems: Discord.js, Google Sheets API, OpenAI/Perspective, Instagram Graph API, and X API. |
| `src/api/` | Presentation | Express.js REST API router and route handlers mounted under `/api/v1`. |
| `src/jobs/` | Infrastructure | Background queue abstraction (`MemoryQueue` or `BullQueue`), scheduled cron jobs, and worker pools. |
| `supabase/migrations/` | Persistence | Modular PostgreSQL migration scripts (12 files) for version-controlled database schema evolution. |
| `tests/` | Quality | Vitest test suites separated into Unit, Integration, and End-to-End tiers. |

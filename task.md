# Game Community Bot — Project Tracking and Roadmap (Feature-Driven)

> Implementation and tracking specification for the Game Community Bot platform, organized by **Feature Vertical Slices**.  
> Primary Specification: [README.md](README.md)  
> Architecture: Modular Clean Architecture with Hexagonal (Ports and Adapters) Boundaries  
> Core Runtime: Bun (v1.0+), TypeScript, Discord.js, Supabase (PostgreSQL), Express.js, Vitest/Bun Test, Winston, Zod

---

## Executive Summary and Progress Tracking

### Milestone Metrics

| Metric | Target | Current Value |
|---|---|---|
| Total Engineering Tasks | 95 | 95 |
| Completed Tasks | 0 | 19 |
| In Progress | 0 | 2 |
| Pending | 95 | 74 |
| Blocked | 0 | 0 |
| Execution Completion | 100% | 20.0% |

### Task State Indicators
- `[ ]` **Pending** — Defined in specification, queued for implementation
- `[/]` **In Progress** — Active development and unit validation underway
- `[x]` **Completed** — Implemented, peer-reviewed, and verified against test suite
- `[!]` **Blocked** — Precondition or external technical dependency pending resolution

---

## Table of Contents

1. [Phase 0: Foundational Infrastructure & Core Framework](#phase-0-foundational-infrastructure--core-framework)
2. [Feature 1: Game Catalog & Guild Configuration](#feature-1-game-catalog--guild-configuration)
3. [Feature 2: Game News Announcement & Ingestion](#feature-2-game-news-announcement--ingestion)
4. [Feature 3: Multi-Platform Publishing System](#feature-3-multi-platform-publishing-system)
5. [Feature 4: Customer Service & Feedback Management](#feature-4-customer-service--feedback-management)
6. [Feature 5: Content Moderation & Anti-Toxicity System](#feature-5-content-moderation--anti-toxicity-system)
7. [Feature 6: Background Queue Infrastructure & Resilient Retry Engine](#feature-6-background-queue-infrastructure--resilient-retry-engine)
8. [Feature 7: Bot Core, API Host & Application Bootstrapping](#feature-7-bot-core-api-host--application-bootstrapping)
9. [Feature 8: DevOps, Containerization & CI/CD](#feature-8-devops-containerization--cicd)

---

## Phase 0: Foundational Infrastructure & Core Framework
> Core configuration, package setup, shared domain primitives, common error handling, and database baseline.  
> References: [README.md](README.md), [Project Structure](docs/project-structure.md), [Security Guidelines](docs/security.md), [Database Architecture](docs/database.md)

- [x] **0.1 Package Management and Build Pipeline**
  - [x] Initialize `package.json` with production and development dependencies (via Bun):
    - Production: `discord.js`, `@supabase/supabase-js`, `express`, `zod`, `dotenv`, `winston`, `node-cron`, `googleapis`, `axios`, `cors`, `helmet`
    - Development: `typescript`, `@types/bun`, `@types/express`, `@types/cors`, `@types/node-cron`, `eslint`, `prettier`
  - [x] Configure `tsconfig.json` with strict type checking, ES2022 target, NodeNext module resolution, and path aliases
  - [x] Configure code quality configurations (`.eslintrc.json`, `.prettierrc`, and `.editorconfig`)
  - [x] Configure Vitest test runner (`vitest.config.ts`) with coverage thresholds and mock isolation
  - [x] Review `.gitignore` and `.env.example` to ensure full compliance with secret protection standards

- [x] **0.2 Central Configuration and Environment Validation**
  - [x] Implement `src/config/constants.ts` for immutable system enums, rate limits, and default configurations
  - [x] Implement `src/config/index.ts` with Zod schema validation to guarantee fail-fast startup behavior on missing variables
  - [x] Implement `src/config/database.ts` delivering the Supabase client singleton backed by `SUPABASE_SERVICE_ROLE_KEY`

- [/] **0.3 Shared Domain Primitives and Error Taxonomy (`src/shared/`)**
  - [x] `src/shared/types/common.ts` — Generic API response envelope (`ApiResponse<T>`), pagination filters, and result containers
  - [x] `src/shared/types/database.ts` — Strongly typed database row definitions generated from Supabase schema
  - [x] `src/shared/types/index.ts` — Unified barrel export for common types
  - [ ] `src/shared/errors/base.error.ts` — Base class `AppError` handling error codes, HTTP status mappings, and correlation metadata
  - [ ] `src/shared/errors/validation.error.ts` — `ValidationError` (HTTP 400)
  - [ ] `src/shared/errors/authentication.error.ts` — `AuthenticationError` (HTTP 401)
  - [ ] `src/shared/errors/authorization.error.ts` — `AuthorizationError` (HTTP 403)
  - [ ] `src/shared/errors/not-found.error.ts` — `NotFoundError` (HTTP 404)
  - [ ] `src/shared/errors/database.error.ts` — `DatabaseError` (HTTP 500)
  - [ ] `src/shared/errors/integration.error.ts` — Base `IntegrationError` (HTTP 502)
  - [ ] `src/shared/errors/index.ts` — Unified barrel export for all error classes

- [ ] **0.4 Shared Utilities and Cross-Cutting Middlewares**
  - [ ] `src/shared/utils/logger.ts` — Structured JSON Winston logger with automated secret masking
  - [ ] `src/shared/utils/id-generator.ts` — Monotonic request ID (`req_*`) and correlation ID (`cor_*`) generator
  - [ ] `src/shared/utils/sanitizer.ts` — Input sanitization and redaction utility
  - [ ] `src/shared/middleware/error-handler.middleware.ts` — Central Express error-handling middleware
  - [ ] `src/shared/middleware/auth.middleware.ts` — Bearer token authentication and role-based access validator
  - [ ] `src/shared/middleware/validation.middleware.ts` — Zod schema validation middleware for HTTP endpoints
  - [ ] `src/shared/middleware/rate-limit.middleware.ts` — Per-route sliding window HTTP rate limiting
  - [ ] `src/shared/middleware/logging.middleware.ts` — HTTP request and response structured logging middleware

- [/] **0.5 Database Foundation, Security, and Seeding**
  - [x] `supabase/migrations/010_create_admin_users.sql` — Schema definition for `admin_users` table storing SHA-256 API key hashes
  - [x] Apply default-deny Row Level Security (RLS) policies across all PostgreSQL tables
  - [x] Establish composite B-tree indexes as specified in the database performance guidelines
  - [ ] Implement `scripts/seed.ts` providing baseline game registries, default moderation lexicons, and initial admin accounts

- [ ] **0.6 Test Infrastructure and Base Fixtures**
  - [ ] `tests/mocks/supabase.mock.ts` — In-memory Supabase client and postgrest query chain mock
  - [ ] `tests/helpers/factories.ts` — Deterministic test entity generation factories
  - [ ] `tests/integration/auth.middleware.test.ts` — Validation of Bearer token extraction, SHA-256 comparison, and RBAC rejection

---

## Feature 1: Game Catalog & Guild Configuration
> Manage registered games and Discord server channel mappings per purpose.  
> References: [Database Architecture](docs/database.md), [Project Structure](docs/project-structure.md), [REST API](docs/api.md)

- [x] **1.1 Database Architecture**
  - [x] `supabase/migrations/001_create_games.sql` — Schema definition for `games` table with unique slug constraint
  - [x] `supabase/migrations/006_create_guild_configs.sql` — Schema definition for `guild_configs` table
  - [x] `supabase/migrations/007_create_channel_mappings.sql` — Schema definition for `channel_mappings` table with composite unique constraint `(guild_id, game_id, purpose)`

- [ ] **1.2 Domain Types & Validation**
  - [ ] `src/shared/types/game.ts` — Game entity models, CreateGameDTO, UpdateGameDTO, and GuildConfig models
  - [ ] `src/modules/games/game.validator.ts` — Zod input validation schemas for game creation and updates

- [ ] **1.3 Application & Repository Modules**
  - [ ] `src/modules/games/game.repository.ts` — Supabase data access layer for the `games` table
  - [ ] `src/modules/games/game.service.ts` — Domain service handling business rules, slug generation, and catalog lifecycle
  - [ ] `src/modules/guild-config/guild-config.repository.ts` — Data access layer for `guild_configs` and `channel_mappings`
  - [ ] `src/modules/guild-config/guild-config.service.ts` — Domain service orchestrating server settings and channel mappings

- [ ] **1.4 RESTful API Endpoints**
  - [ ] `src/api/routes/games.routes.ts`
    - `POST /api/v1/games` — Register new game entry in catalog (Role: Admin+)
    - `GET /api/v1/games` — List registered game records (Role: Editor+)
    - `GET /api/v1/games/:id` — Retrieve specific game details (Role: Editor+)
    - `PUT /api/v1/games/:id` — Update game metadata (Role: Admin+)
    - `DELETE /api/v1/games/:id` — Deactivate game entry (Role: Admin+)

- [ ] **1.5 Discord Commands & Gateway Handlers**
  - [ ] `src/integrations/discord/events/guild-create.ts` — Guild join listener provisioning default configuration entries
  - [ ] `src/integrations/discord/commands/config.command.ts` — Administrative slash command handler for guild and channel configurations

- [ ] **1.6 Testing & Verification**
  - [ ] `tests/integration/games.api.test.ts` — End-to-end HTTP tests on `/api/v1/games` endpoints

---

## Feature 2: Game News Announcement & Ingestion
> Ingest news from RSS/REST sources, manage draft lifecycles, deduplicate, schedule, and approve announcements.  
> References: [Publishing](docs/publishing.md), [Background Jobs](docs/background-jobs.md), [REST API](docs/api.md)

- [x] **2.1 Database Architecture**
  - [x] `supabase/migrations/002_create_news.sql` — Schema definition for `news` table with `external_id` deduplication index
  - [x] `supabase/migrations/011_create_scheduled_news.sql` — Schema definition for `scheduled_news` queue

- [ ] **2.2 Domain Types & Port Contracts**
  - [ ] `src/shared/types/news.ts` — News entity models, publication states (`draft`, `ready`, `published`, `archived`), and query filters
  - [ ] `src/shared/interfaces/news-source.interface.ts` — `NewsSource` port specification (`fetchLatest`, `parseFeed`)

- [ ] **2.3 News Ingestion & Management Core Module (`src/modules/news/`)**
  - [ ] `src/modules/news/news.validator.ts` — Zod input validation schemas for news drafts and publication requests
  - [ ] `src/modules/news/news.repository.ts` — Data access layer for `news` and `scheduled_news`
  - [ ] `src/modules/news/news.service.ts` — Core service handling draft lifecycle, state machine, and deduplication
  - [ ] `src/modules/news/news-source/news-source.service.ts` — Coordinator for polling and aggregating multi-source feeds
  - [ ] `src/modules/news/news-source/rss-source.adapter.ts` — RSS feed parser implementation of `NewsSource`
  - [ ] `src/modules/news/news-source/api-source.adapter.ts` — REST API feed consumer implementation of `NewsSource`
  - [ ] `src/modules/news/news-scheduler/news-scheduler.service.ts` — Service managing publication timing and queue dispatch

- [ ] **2.4 Background Workers & Schedulers**
  - [ ] `src/jobs/workers/news-fetch.worker.ts` — Polling worker querying external feeds for prospective updates
  - [ ] `src/jobs/workers/scheduled-news.worker.ts` — Dispatcher evaluating scheduled announcements reaching target timestamp

- [ ] **2.5 RESTful API Endpoints**
  - [ ] `src/api/routes/news.routes.ts`
    - `POST /api/v1/news` — Create news draft (Role: Admin+)
    - `GET /api/v1/news` — Retrieve paginated news list with query filters (Role: Editor+)
    - `GET /api/v1/news/:id` — Retrieve single news article by ID (Role: Editor+)
    - `PUT /api/v1/news/:id` — Update existing news content (Role: Editor+)
    - `DELETE /api/v1/news/:id` — Soft-delete news article (Role: Admin+)
    - `PATCH /api/v1/news/:id/status` — Mutate publication state (Role: Editor+)

- [ ] **2.6 Discord Presentation & Commands**
  - [ ] `src/integrations/discord/embeds/news.embed.ts` — Visual embed formatter for game announcements
  - [ ] `src/integrations/discord/commands/news.command.ts` — Slash command handler for `/news list`, `/news publish <id>`, and `/news create`

- [ ] **2.7 Testing & Verification**
  - [ ] `tests/unit/news.service.test.ts` — Validation of draft lifecycle, status guards, and deduplication logic
  - [ ] `tests/integration/news.api.test.ts` — End-to-end HTTP tests on `/api/v1/news` endpoints
  - [ ] `tests/e2e/news-publish-flow.test.ts` — Lifecycle verification: Ingestion -> Draft -> Approval -> Queue delivery

---

## Feature 3: Multi-Platform Publishing System
> Fan-out news announcements across Discord, Instagram, X/Twitter, and Reddit with independent failure isolation.  
> References: [Publishing](docs/publishing.md), [Background Jobs](docs/background-jobs.md), [REST API](docs/api.md)

- [x] **3.1 Database Architecture**
  - [x] `supabase/migrations/003_create_news_publications.sql` — Schema definition for `news_publications` table tracking delivery per platform
  - [x] `supabase/migrations/008_create_platform_configs.sql` — Schema definition for `platform_configs` table with JSONB settings

- [ ] **3.2 Domain Contracts, Types & Errors**
  - [ ] `src/shared/types/publishing.ts` — Platform payload contracts, PublishResult, and SocialPlatform definitions
  - [ ] `src/shared/interfaces/publisher.interface.ts` — `SocialPublisher` port specification (`publish`, `validate`, `formatContent`)
  - [ ] `src/shared/errors/publishing.error.ts` — `PublishingError` and `SocialPlatformError` (HTTP 502)

- [ ] **3.3 Core Publishing Engine (`src/modules/publishing/`)**
  - [ ] `src/modules/publishing/publication.repository.ts` — Data access layer managing `news_publications` records
  - [ ] `src/modules/publishing/publisher.registry.ts` — Registry managing active adapters and platform enablement
  - [ ] `src/modules/publishing/publishers/discord.publisher.ts` — Adapter delivering rich embeds to mapped Discord channels
  - [ ] `src/modules/publishing/publishers/instagram.publisher.ts` — Adapter communicating with the Instagram Graph API
  - [ ] `src/modules/publishing/publishers/x.publisher.ts` — Adapter delivering announcements via X/Twitter API v2
  - [ ] `src/modules/publishing/publishers/reddit.publisher.ts` — Adapter submitting link/text announcements to designated subreddits
  - [ ] `src/modules/publishing/publishing.service.ts` — Fan-out orchestrator implementing `Promise.allSettled` and independent failure isolation

- [ ] **3.4 External Social Media Clients (`src/integrations/social/`)**
  - [ ] `src/integrations/social/instagram/instagram.client.ts` — HTTP client for media container creation and publishing via Instagram Graph API
  - [ ] `src/integrations/social/x/x.client.ts` — HTTP client for tweet creation with media support via Twitter API v2
  - [ ] `src/integrations/social/reddit/reddit.client.ts` — HTTP client managing OAuth tokens and submission handling via Reddit API

- [ ] **3.5 Background Publishing Worker**
  - [ ] `src/jobs/workers/news-publish.worker.ts` — Asynchronous consumer executing fan-out social publications

- [ ] **3.6 RESTful API Endpoints**
  - [ ] `src/api/routes/platforms.routes.ts`
    - `GET /api/v1/platforms` — Query configured platform statuses and limits (Role: Admin+)
    - `PATCH /api/v1/platforms/:platform` — Update platform activation or configurations (Role: Admin+)
  - [ ] Sub-routes in `src/api/routes/news.routes.ts`:
    - `POST /api/v1/news/:id/publish` — Fan-out publication across all active channels (Role: Admin+)
    - `POST /api/v1/news/:id/publish/discord` — Publish news strictly to Discord (Role: Admin+)
    - `POST /api/v1/news/:id/publish/social` — Publish news strictly to social platforms (Role: Admin+)

- [ ] **3.7 Testing & Verification**
  - [ ] `tests/mocks/social.mock.ts` — Mock clients for Instagram, X/Twitter, and Reddit APIs
  - [ ] `tests/unit/publishing.service.test.ts` — Validation of fan-out orchestration and partial failure handling

---

## Feature 4: Customer Service & Feedback Management
> Intake user feedback across 5 categories via Discord modals or API, store in Supabase, and synchronize to Google Sheets.  
> References: [Customer Service](docs/customer-service.md), [Database Architecture](docs/database.md)

- [x] **4.1 Database Architecture**
  - [x] `supabase/migrations/004_create_feedback.sql` — Schema definition for `feedback` table covering the five defined categories

- [ ] **4.2 Domain Types & Errors**
  - [ ] `src/shared/types/feedback.ts` — Feedback entity models, categorization enums (`critique`, `suggestion`, `bug`, `feedback`, `complaint`), and DTOs
  - [ ] `src/shared/errors/integration.error.ts` (extended) — `GoogleSheetsError` (HTTP 502)

- [ ] **4.3 Core Feedback Module (`src/modules/feedback/`)**
  - [ ] `src/modules/feedback/feedback.validator.ts` — Zod schemas validating user submissions across the five supported categories
  - [ ] `src/modules/feedback/feedback.repository.ts` — Data access layer for the `feedback` table
  - [ ] `src/modules/feedback/feedback.service.ts` — Ingestion pipeline securing records in Supabase before queuing Google Sheets synchronization

- [ ] **4.4 External Integration: Google Sheets (`src/integrations/google-sheets/`)**
  - [ ] `src/integrations/google-sheets/client.ts` — Google Sheets client authentication using Google Service Account credentials
  - [ ] `src/integrations/google-sheets/sheets.service.ts` — Row insertion engine mapping feedback records into standardized spreadsheet format

- [ ] **4.5 Background Sync Worker**
  - [ ] `src/jobs/workers/feedback-sync.worker.ts` — Consumer processing pending feedback entries and writing to Google Sheets

- [ ] **4.6 RESTful API Endpoints**
  - [ ] `src/api/routes/feedback.routes.ts`
    - `POST /api/v1/feedback` — Submit feedback from external integrations (Public, rate-limited)
    - `GET /api/v1/feedback` — Retrieve filtered feedback records (Role: Editor+)
    - `GET /api/v1/feedback/:id` — Retrieve detailed feedback submission (Role: Editor+)
    - `PATCH /api/v1/feedback/:id/status` — Update feedback workflow status (Role: Editor+)
    - `POST /api/v1/feedback/:id/sync` — Trigger immediate manual Google Sheets synchronization (Role: Admin+)

- [ ] **4.7 Discord Interaction & Commands**
  - [ ] `src/integrations/discord/embeds/feedback.embed.ts` — Visual embed formatter for customer service submissions
  - [ ] `src/integrations/discord/commands/feedback.command.ts` — Slash command handler for `/feedback` presenting interactive modal
  - [ ] `src/integrations/discord/commands/report.command.ts` — Slash command handler for `/report` bug intake shortcut

- [ ] **4.8 Testing & Verification**
  - [ ] `tests/mocks/google-sheets.mock.ts` — Google Sheets API mock simulator
  - [ ] `tests/unit/feedback.service.test.ts` — Validation of feedback categorization and sheet sync queuing
  - [ ] `tests/integration/feedback.api.test.ts` — End-to-end HTTP tests on `/api/v1/feedback` endpoints
  - [ ] `tests/e2e/feedback-pipeline.test.ts` — Lifecycle verification: Modal submission -> Supabase storage -> Google Sheets sync

---

## Feature 5: Content Moderation & Anti-Toxicity System
> Multi-stage content filtering pipeline: fast rule-based regex followed by AI semantic analysis, triggering automated actions.  
> References: [Moderation](docs/moderation.md), [Database Architecture](docs/database.md)

- [x] **5.1 Database Architecture**
  - [x] `supabase/migrations/005_create_moderation_logs.sql` — Schema definition for `moderation_logs` audit repository
  - [x] `supabase/migrations/009_create_bad_words.sql` — Schema definition for `bad_words` dictionary table

- [ ] **5.2 Domain Types, Contracts & Errors**
  - [ ] `src/shared/types/moderation.ts` — Moderation decision structures, action enums, and severity taxonomies
  - [ ] `src/shared/interfaces/moderation-provider.interface.ts` — `ModerationProvider` port specification (`name`, `priority`, `check`, `canHandle`)
  - [ ] `src/shared/errors/moderation.error.ts` — `ModerationError` (HTTP 500)

- [ ] **5.3 Core Moderation Module (`src/modules/moderation/`)**
  - [ ] `src/modules/moderation/moderation.repository.ts` — Data access layer for `moderation_logs` and `bad_words`
  - [ ] `src/modules/moderation/moderation.registry.ts` — Priority-ordered provider chain manager
  - [ ] `src/modules/moderation/providers/rule-based.provider.ts` — High-performance (<1ms) in-memory wordlist and regex filter
  - [ ] `src/modules/moderation/providers/openai.provider.ts` — Semantic and multimodal content evaluation provider
  - [ ] `src/modules/moderation/providers/perspective.provider.ts` — Google Perspective API toxicity scoring provider
  - [ ] `src/modules/moderation/moderation.service.ts` — Decision matrix engine executing automated responses (`delete`, `warn`, `timeout`, `ban`)

- [ ] **5.4 External AI Integration Adapter (`src/integrations/ai/`)**
  - [ ] `src/integrations/ai/client.ts` — Client factory supporting OpenAI and Perspective API credentials
  - [ ] `src/integrations/ai/ai.service.ts` — Unified facade for natural language toxicity evaluation and multimodal image inspection

- [ ] **5.5 Discord Event Listeners & Slash Commands**
  - [ ] `src/integrations/discord/events/message-create.ts` — Message stream listener routing messages through moderation pipeline
  - [ ] `src/integrations/discord/embeds/moderation.embed.ts` — Visual embed formatter for moderation notifications
  - [ ] `src/integrations/discord/commands/moderation.command.ts` — Moderation slash command handler for rule enforcement and statistics

- [ ] **5.6 Testing & Verification**
  - [ ] `tests/mocks/ai.mock.ts` — Mock implementations of OpenAI and Perspective moderation responses
  - [ ] `tests/unit/moderation.service.test.ts` — Validation of rule provider, leetspeak filters, and decision matrix actions
  - [ ] `tests/e2e/moderation-pipeline.test.ts` — Lifecycle verification: Message ingestion -> Rule matching -> Action dispatch -> Audit logging

---

## Feature 6: Background Queue Infrastructure & Resilient Retry Engine
> Queue abstractions, exponential backoff with jitter, dead-letter tracking, and periodic job execution.  
> References: [Background Jobs](docs/background-jobs.md), [Database Architecture](docs/database.md)

- [x] **6.1 Database Architecture**
  - [x] `supabase/migrations/012_create_retry_jobs.sql` — Schema definition for `retry_jobs` resilient queue

- [ ] **6.2 Queue Ports and Abstractions (`src/jobs/queue/`)**
  - [ ] `src/shared/interfaces/queue.interface.ts` — `JobQueue` port specification (`enqueue`, `process`, `getStatus`)
  - [ ] `src/shared/utils/retry.ts` — Generic exponential backoff execution wrapper with jitter
  - [ ] `src/jobs/queue/memory-queue.ts` — In-process FIFO queue implementation with exponential delay execution (zero Redis requirement)
  - [ ] `src/jobs/queue/bull-queue.ts` — Redis-backed BullMQ implementation for horizontally scalable production workloads

- [ ] **6.3 Resilient Retry Worker and Cron Scheduler**
  - [ ] `src/jobs/workers/retry.worker.ts` — Resilient worker re-attempting failed jobs recorded in `retry_jobs`
  - [ ] `src/jobs/scheduler/cron-scheduler.ts` — Task scheduler driven by `node-cron`:
    - `news-fetch`: `*/15 * * * *` (Every 15 minutes)
    - `scheduled-news`: `* * * * *` (Every 1 minute)
    - `retry`: `*/5 * * * *` (Every 5 minutes)
    - `cleanup`: `0 3 * * *` (Daily at 03:00 UTC)
  - [ ] `src/jobs/index.ts` — Master bootstrap initiating queues, registering workers, and starting cron schedules

- [ ] **6.4 Testing & Verification**
  - [ ] `tests/unit/retry.test.ts` — Validation of exponential backoff calculation and maximum retry termination

---

## Feature 7: Bot Core, API Host & Application Bootstrapping
> Discord client lifecycle, router mounts, health check monitoring, and master runtime supervisor.  
> References: [Architecture](docs/architecture.md), [Project Structure](docs/project-structure.md)

- [ ] **7.1 Discord Gateway Client Base (`src/integrations/discord/`)**
  - [ ] `src/integrations/discord/client.ts` — Discord.js client initialization specifying minimal privileged gateway intents
  - [ ] `src/integrations/discord/utils/permissions.ts` — Role hierarchy and Discord permission evaluation helpers
  - [ ] `src/integrations/discord/utils/interaction-helpers.ts` — Utility helpers for acknowledgments, deferrals, and standardized replies
  - [ ] `src/integrations/discord/events/ready.ts` — Gateway connection handler, cache warm-up, and status logger
  - [ ] `src/integrations/discord/events/interaction-create.ts` — Router directing slash commands, modal inputs, and component interactions
  - [ ] `src/integrations/discord/events/index.ts` — Dynamic event registration loader
  - [ ] `src/integrations/discord/commands/help.command.ts` — Slash command handler displaying command usage and guidance
  - [ ] `src/integrations/discord/commands/index.ts` — Dynamic command registry and lookup index
  - [ ] `src/integrations/discord/deploy.ts` — Command deployment utility registering definitions with Discord REST API

- [ ] **7.2 Express REST Application Assembly**
  - [ ] `src/api/routes/health.routes.ts` — `GET /api/v1/health` verifying process uptime, database connectivity, and subsystem statuses
  - [ ] `src/api/router.ts` — Central mount mapping route groups under the `/api/v1` namespace
  - [ ] `src/api/index.ts` — Express factory applying Helmet, CORS policy, JSON parsing, rate limiting, and Winston logging

- [ ] **7.3 Central Application Runtime Lifecycle**
  - [ ] `src/bot.ts` — Discord bot initialization, gateway authentication, and event binding
  - [ ] `src/server.ts` — Express REST API HTTP server initialization and port binding
  - [ ] `src/index.ts` — Central runtime supervisor:
    - Validates environment configurations through Zod
    - Initializes Supabase connectivity and validates schema readiness
    - Populates registry instances for publishers and moderation providers
    - Concurrently boots Discord gateway client and Express REST server
    - Starts background queue workers and cron task scheduler
    - Attaches process event handlers for graceful termination (`SIGINT`, `SIGTERM`)

- [ ] **7.4 Testing Mocks**
  - [ ] `tests/mocks/discord.mock.ts` — Mock Discord client, guild channels, and interaction structures

---

## Feature 8: DevOps, Containerization & CI/CD
> Container build, runtime management, and automated continuous integration.  
> References: [Deployment Guide](docs/deployment.md)

- [ ] `Dockerfile` — Multi-stage Alpine containerization separating build dependencies from minimal production runtime
- [ ] `docker-compose.yml` — Container orchestration configuration with service definitions for application and optional Redis
- [ ] `ecosystem.config.js` — PM2 runtime specification enforcing resource limits and automated clustering
- [ ] `.github/workflows/ci.yml` — Continuous Integration pipeline executing type checking, linting, and Vitest test suites
- [ ] Production audit verifying adherence to the [Deployment Production Checklist](docs/deployment.md#production-checklist)

# Game Community Bot — Project Tracking and Roadmap

> Implementation and tracking specification for the Game Community Bot platform.  
> Primary Specification: [README.md](README.md)  
> Architecture: Modular Clean Architecture with Hexagonal (Ports and Adapters) Boundaries  
> Core Runtime: Node.js (v20+ LTS), TypeScript, Discord.js, Supabase (PostgreSQL), Express.js, Vitest, Winston, Zod

---

## Executive Summary and Progress Tracking

### Milestone Metrics

| Metric | Target | Current Value |
|---|---|---|
| Total Engineering Tasks | 95 | 95 |
| Completed Tasks | 0 | 0 |
| In Progress | 0 | 0 |
| Pending | 95 | 95 |
| Blocked | 0 | 0 |
| Execution Completion | 100% | 0.0% |

### Task State Indicators
- `[ ]` **Pending** — Defined in specification, queued for implementation
- `[/]` **In Progress** — Active development and unit validation underway
- `[x]` **Completed** — Implemented, peer-reviewed, and verified against test suite
- `[!]` **Blocked** — Precondition or external technical dependency pending resolution

---

## Table of Contents
1. [Phase 1: Project Setup and Foundational Infrastructure](#phase-1-project-setup-and-foundational-infrastructure)
2. [Phase 2: Database Architecture and Supabase Migrations](#phase-2-database-architecture-and-supabase-migrations)
3. [Phase 3: Domain Types, Contracts, and Core Infrastructure](#phase-3-domain-types-contracts-and-core-infrastructure)
4. [Phase 4: Core Domain Application Modules](#phase-4-core-domain-application-modules)
5. [Phase 5: External Integration Adapters](#phase-5-external-integration-adapters)
6. [Phase 6: RESTful API Presentation Layer](#phase-6-restful-api-presentation-layer)
7. [Phase 7: Asynchronous Background Jobs and Schedulers](#phase-7-asynchronous-background-jobs-and-schedulers)
8. [Phase 8: Application Bootstrapping and Runtime Lifecycle](#phase-8-application-bootstrapping-and-runtime-lifecycle)
9. [Phase 9: Quality Assurance and Automated Testing](#phase-9-quality-assurance-and-automated-testing)
10. [Phase 10: DevOps, Containerization, and Deployment](#phase-10-devops-containerization-and-deployment)

---

## Phase 1: Project Setup and Foundational Infrastructure
> References: [README.md](README.md), [Project Structure](docs/project-structure.md), [Security Guidelines](docs/security.md)

- [ ] **1.1 Package Management and Build Pipeline**
  - [ ] Initialize `package.json` with production and development dependencies:
    - Production: `discord.js`, `@supabase/supabase-js`, `express`, `zod`, `dotenv`, `winston`, `node-cron`, `googleapis`, `axios`, `cors`, `helmet`
    - Development: `typescript`, `tsx`, `vitest`, `@types/node`, `@types/express`, `@types/cors`, `@types/node-cron`, `eslint`, `prettier`
  - [ ] Configure `tsconfig.json` with strict type checking, ES2022 target, NodeNext module resolution, and path aliases
  - [ ] Configure code quality configurations (`.eslintrc.json`, `.prettierrc`, and `.editorconfig`)
  - [ ] Configure Vitest test runner (`vitest.config.ts`) with coverage thresholds and mock isolation
  - [ ] Review `.gitignore` and `.env.example` to ensure full compliance with secret protection standards

- [ ] **1.2 Central Configuration and Environment Validation**
  - [ ] Implement `src/config/constants.ts` for immutable system enums, rate limits, and default configurations
  - [ ] Implement `src/config/index.ts` with Zod schema validation to guarantee fail-fast startup behavior on missing variables
  - [ ] Implement `src/config/database.ts` delivering the Supabase client singleton backed by `SUPABASE_SERVICE_ROLE_KEY`

---

## Phase 2: Database Architecture and Supabase Migrations
> References: [Database Architecture and Schema](docs/database.md)

- [ ] **2.1 Core Domain Schema Migrations**
  - [ ] `supabase/migrations/001_create_games.sql` — Schema definition for `games` table with unique slug constraint
  - [ ] `supabase/migrations/002_create_news.sql` — Schema definition for `news` table with `external_id` deduplication index
  - [ ] `supabase/migrations/003_create_news_publications.sql` — Schema definition for `news_publications` table tracking delivery per platform
  - [ ] `supabase/migrations/004_create_feedback.sql` — Schema definition for `feedback` table covering the five defined categories
  - [ ] `supabase/migrations/005_create_moderation_logs.sql` — Schema definition for `moderation_logs` audit repository

- [ ] **2.2 Configuration and Authorization Migrations**
  - [ ] `supabase/migrations/006_create_guild_configs.sql` — Schema definition for `guild_configs` table
  - [ ] `supabase/migrations/007_create_channel_mappings.sql` — Schema definition for `channel_mappings` table with composite unique constraint `(guild_id, game_id, purpose)`
  - [ ] `supabase/migrations/008_create_platform_configs.sql` — Schema definition for `platform_configs` table with JSONB settings
  - [ ] `supabase/migrations/009_create_bad_words.sql` — Schema definition for `bad_words` dictionary table
  - [ ] `supabase/migrations/010_create_admin_users.sql` — Schema definition for `admin_users` table storing SHA-256 API key hashes

- [ ] **2.3 Background Job and Queue Migrations**
  - [ ] `supabase/migrations/011_create_scheduled_news.sql` — Schema definition for `scheduled_news` queue
  - [ ] `supabase/migrations/012_create_retry_jobs.sql` — Schema definition for `retry_jobs` resilient queue

- [ ] **2.4 Database Security and Seeding**
  - [ ] Apply default-deny Row Level Security (RLS) policies across all 12 PostgreSQL tables
  - [ ] Establish composite B-tree indexes as specified in the database performance guidelines
  - [ ] Implement `scripts/seed.ts` providing baseline game registries, default moderation lexicons, and initial admin accounts

---

## Phase 3: Domain Types, Contracts, and Core Infrastructure
> References: [Architecture and System Flow](docs/architecture.md), [Project Structure](docs/project-structure.md), [Error Handling and Observability](docs/error-handling-and-logging.md)

- [ ] **3.1 Shared Domain Type Definitions (`src/shared/types/`)**
  - [ ] `common.ts` — Generic API response envelope (`ApiResponse<T>`), pagination filters, and result containers
  - [ ] `database.ts` — Strongly typed database row definitions generated from Supabase schema
  - [ ] `game.ts` — Game entity models, CreateGameDTO, and UpdateGameDTO
  - [ ] `news.ts` — News entity models, publication states (`draft`, `ready`, `published`, `archived`), and query filters
  - [ ] `feedback.ts` — Feedback entity models, categorization enums (`kritik`, `saran`, `bug`, `feedback`, `complaint`), and DTOs
  - [ ] `moderation.ts` — Moderation decision structures, action enums, and severity taxonomies
  - [ ] `publishing.ts` — Platform payload contracts, PublishResult, and SocialPlatform definitions
  - [ ] `index.ts` — Unified barrel export for all domain types

- [ ] **3.2 Hexagonal Ports and Domain Interfaces (`src/shared/interfaces/`)**
  - [ ] `publisher.interface.ts` — `SocialPublisher` port specification (`publish`, `validate`, `formatContent`)
  - [ ] `moderation-provider.interface.ts` — `ModerationProvider` port specification (`name`, `priority`, `check`, `canHandle`)
  - [ ] `queue.interface.ts` — `JobQueue` port specification (`enqueue`, `process`, `getStatus`)
  - [ ] `news-source.interface.ts` — `NewsSource` port specification (`fetchLatest`, `parseFeed`)

- [ ] **3.3 Exception Taxonomy and Error Classes (`src/shared/errors/`)**
  - [ ] `base.error.ts` — Base class `AppError` handling error codes, HTTP status mappings, and correlation metadata
  - [ ] `validation.error.ts` — `ValidationError` (HTTP 400)
  - [ ] `authentication.error.ts` — `AuthenticationError` (HTTP 401)
  - [ ] `authorization.error.ts` — `AuthorizationError` (HTTP 403)
  - [ ] `not-found.error.ts` — `NotFoundError` (HTTP 404)
  - [ ] `database.error.ts` — `DatabaseError` (HTTP 500)
  - [ ] `integration.error.ts` — `IntegrationError`, `GoogleSheetsError`, and `SocialPlatformError` (HTTP 502)
  - [ ] `publishing.error.ts` — `PublishingError` (HTTP 502)
  - [ ] `moderation.error.ts` — `ModerationError` (HTTP 500)
  - [ ] `index.ts` — Unified barrel export for all error classes

- [ ] **3.4 Shared Utility Functions and Cross-Cutting Middlewares**
  - [ ] `src/shared/utils/logger.ts` — Structured JSON Winston logger with automated secret masking
  - [ ] `src/shared/utils/retry.ts` — Generic exponential backoff execution wrapper with jitter
  - [ ] `src/shared/utils/rate-limiter.ts` — In-memory token bucket rate limiter
  - [ ] `src/shared/utils/id-generator.ts` — Monotonic request ID (`req_*`) and correlation ID (`cor_*`) generator
  - [ ] `src/shared/utils/sanitizer.ts` — Input sanitization and redaction utility
  - [ ] `src/shared/middleware/error-handler.middleware.ts` — Central Express error-handling middleware
  - [ ] `src/shared/middleware/auth.middleware.ts` — Bearer token authentication and role-based access validator
  - [ ] `src/shared/middleware/validation.middleware.ts` — Zod schema validation middleware for HTTP endpoints
  - [ ] `src/shared/middleware/rate-limit.middleware.ts` — Per-route sliding window HTTP rate limiting
  - [ ] `src/shared/middleware/logging.middleware.ts` — HTTP request and response structured logging middleware

---

## Phase 4: Core Domain Application Modules
> References: [Architecture](docs/architecture.md), [Publishing](docs/publishing.md), [Moderation](docs/moderation.md), [Customer Service](docs/customer-service.md)

- [ ] **4.1 Game Catalog Module (`src/modules/games/`)**
  - [ ] `game.validator.ts` — Zod input validation schemas for game creation and updates
  - [ ] `game.repository.ts` — Supabase data access layer for the `games` table
  - [ ] `game.service.ts` — Domain service handling business rules, slug generation, and catalog lifecycle

- [ ] **4.2 Guild Configuration Module (`src/modules/guild-config/`)**
  - [ ] `guild-config.repository.ts` — Data access layer for `guild_configs` and `channel_mappings`
  - [ ] `guild-config.service.ts` — Domain service orchestrating server settings and channel mappings

- [ ] **4.3 News Processing and Ingestion Module (`src/modules/news/`)**
  - [ ] `news.validator.ts` — Zod input validation schemas for news drafts and publication requests
  - [ ] `news.repository.ts` — Data access layer for `news` and `scheduled_news`
  - [ ] `news.service.ts` — Core service handling draft lifecycle, state machine, and deduplication
  - [ ] `news-source/news-source.service.ts` — Coordinator for polling and aggregating multi-source feeds
  - [ ] `news-source/rss-source.adapter.ts` — RSS feed parser implementation of `NewsSource`
  - [ ] `news-source/api-source.adapter.ts` — REST API feed consumer implementation of `NewsSource`
  - [ ] `news-scheduler/news-scheduler.service.ts` — Service managing publication timing and queue dispatch

- [ ] **4.4 Multi-Platform Publishing Module (`src/modules/publishing/`)**
  - [ ] `publication.repository.ts` — Data access layer managing `news_publications` records
  - [ ] `publisher.registry.ts` — Registry managing active adapters and platform enablement
  - [ ] `publishers/discord.publisher.ts` — Adapter delivering rich embeds to mapped Discord channels
  - [ ] `publishers/instagram.publisher.ts` — Adapter communicating with the Instagram Graph API
  - [ ] `publishers/x.publisher.ts` — Adapter delivering announcements via X/Twitter API v2
  - [ ] `publishers/reddit.publisher.ts` — Adapter submitting link/text announcements to designated subreddits
  - [ ] `publishing.service.ts` — Fan-out orchestrator implementing `Promise.allSettled` and independent failure isolation

- [ ] **4.5 Content Moderation Module (`src/modules/moderation/`)**
  - [ ] `moderation.repository.ts` — Data access layer for `moderation_logs` and `bad_words`
  - [ ] `moderation.registry.ts` — Priority-ordered provider chain manager
  - [ ] `providers/rule-based.provider.ts` — High-performance (<1ms) in-memory wordlist and regex filter
  - [ ] `providers/openai.provider.ts` — Semantic and multimodal content evaluation provider
  - [ ] `providers/perspective.provider.ts` — Google Perspective API toxicity scoring provider
  - [ ] `moderation.service.ts` — Decision matrix engine executing automated responses (`delete`, `warn`, `timeout`, `ban`)

- [ ] **4.6 Customer Service and Feedback Module (`src/modules/feedback/`)**
  - [ ] `feedback.validator.ts` — Zod schemas validating user submissions across the five supported categories
  - [ ] `feedback.repository.ts` — Data access layer for the `feedback` table
  - [ ] `feedback.service.ts` — Ingestion pipeline securing records in Supabase before queuing Google Sheets synchronization

---

## Phase 5: External Integration Adapters
> References: [Project Structure](docs/project-structure.md), [Customer Service](docs/customer-service.md), [Moderation](docs/moderation.md)

- [ ] **5.1 Discord Gateway and Command Client (`src/integrations/discord/`)**
  - [ ] `client.ts` — Discord.js client initialization specifying minimal privileged gateway intents
  - [ ] `utils/permissions.ts` — Role hierarchy and Discord permission evaluation helpers
  - [ ] `utils/interaction-helpers.ts` — Utility helpers for acknowledgments, deferrals, and standardized replies
  - [ ] `embeds/news.embed.ts` — Visual embed formatter for game announcements
  - [ ] `embeds/feedback.embed.ts` — Visual embed formatter for customer service submissions
  - [ ] `embeds/moderation.embed.ts` — Visual embed formatter for moderation notifications
  - [ ] `events/ready.ts` — Gateway connection handler, cache warm-up, and status logger
  - [ ] `events/interaction-create.ts` — Router directing slash commands, modal inputs, and component interactions
  - [ ] `events/message-create.ts` — Message stream listener routing messages through moderation pipeline
  - [ ] `events/guild-create.ts` — Guild join listener provisioning default configuration entries
  - [ ] `events/index.ts` — Dynamic event registration loader
  - [ ] **Discord Slash Command Implementations (`src/integrations/discord/commands/`)**:
    - [ ] `news.command.ts` — Slash command handler for `/news list`, `/news publish <id>`, and `/news create`
    - [ ] `feedback.command.ts` — Slash command handler for `/feedback` presenting the interactive modal
    - [ ] `report.command.ts` — Slash command handler for `/report` bug intake shortcut
    - [ ] `config.command.ts` — Administrative slash command handler for guild and channel configurations
    - [ ] `moderation.command.ts` — Moderation slash command handler for rule enforcement and statistics
    - [ ] `help.command.ts` — Slash command handler displaying command usage and guidance
    - [ ] `index.ts` — Dynamic command registry and lookup index
    - [ ] `deploy.ts` — Command deployment utility registering definitions with Discord REST API

- [ ] **5.2 Google Sheets Integration Adapter (`src/integrations/google-sheets/`)**
  - [ ] `client.ts` — Google Sheets client authentication using Google Service Account credentials
  - [ ] `sheets.service.ts` — Row insertion engine mapping feedback records into standardized spreadsheet format

- [ ] **5.3 Artificial Intelligence Client Adapter (`src/integrations/ai/`)**
  - [ ] `client.ts` — Client factory supporting OpenAI and Perspective API credentials
  - [ ] `ai.service.ts` — Unified facade for natural language toxicity evaluation and multimodal image inspection

- [ ] **5.4 Social Media External Clients (`src/integrations/social/`)**
  - [ ] `instagram/instagram.client.ts` — HTTP client for media container creation and publishing via Instagram Graph API
  - [ ] `x/x.client.ts` — HTTP client for tweet creation with media support via Twitter API v2
  - [ ] `reddit/reddit.client.ts` — HTTP client managing OAuth tokens and submission handling via Reddit API

---

## Phase 6: RESTful API Presentation Layer
> References: [REST API Documentation](docs/api.md), [Security Guidelines](docs/security.md)

- [ ] **6.1 Route Handlers (`src/api/routes/`)**
  - [ ] `news.routes.ts`
    - `POST /api/v1/news` — Create news draft (Role: Admin+)
    - `GET /api/v1/news` — Retrieve paginated news list with query filters (Role: Editor+)
    - `GET /api/v1/news/:id` — Retrieve single news article by ID (Role: Editor+)
    - `PUT /api/v1/news/:id` — Update existing news content (Role: Editor+)
    - `DELETE /api/v1/news/:id` — Soft-delete news article (Role: Admin+)
    - `POST /api/v1/news/:id/publish` — Fan-out publication across all active channels (Role: Admin+)
    - `POST /api/v1/news/:id/publish/discord` — Publish news strictly to Discord (Role: Admin+)
    - `POST /api/v1/news/:id/publish/social` — Publish news strictly to social platforms (Role: Admin+)
    - `PATCH /api/v1/news/:id/status` — Mutate publication state (Role: Editor+)
  - [ ] `feedback.routes.ts`
    - `POST /api/v1/feedback` — Submit feedback from external integrations (Public, rate-limited)
    - `GET /api/v1/feedback` — Retrieve filtered feedback records (Role: Editor+)
    - `GET /api/v1/feedback/:id` — Retrieve detailed feedback submission (Role: Editor+)
    - `PATCH /api/v1/feedback/:id/status` — Update feedback workflow status (Role: Editor+)
    - `POST /api/v1/feedback/:id/sync` — Trigger immediate manual Google Sheets synchronization (Role: Admin+)
  - [ ] `games.routes.ts`
    - `POST /api/v1/games` — Register new game entry in catalog (Role: Admin+)
    - `GET /api/v1/games` — List registered game records (Role: Editor+)
    - `GET /api/v1/games/:id` — Retrieve specific game details (Role: Editor+)
    - `PUT /api/v1/games/:id` — Update game metadata (Role: Admin+)
    - `DELETE /api/v1/games/:id` — Deactivate game entry (Role: Admin+)
  - [ ] `platforms.routes.ts`
    - `GET /api/v1/platforms` — Query configured platform statuses and limits (Role: Admin+)
    - `PATCH /api/v1/platforms/:platform` — Update platform activation or configurations (Role: Admin+)
  - [ ] `health.routes.ts`
    - `GET /api/v1/health` — Public endpoint verifying process uptime, database connectivity, and subsystem statuses

- [ ] **6.2 Express Application Assembly**
  - [ ] `src/api/router.ts` — Central mount mapping route groups under the `/api/v1` namespace
  - [ ] `src/api/index.ts` — Express factory applying Helmet, CORS policy, JSON parsing, rate limiting, and Winston logging

---

## Phase 7: Asynchronous Background Jobs and Schedulers
> References: [Background Jobs and Workers](docs/background-jobs.md)

- [ ] **7.1 Job Queue Abstractions (`src/jobs/queue/`)**
  - [ ] `memory-queue.ts` — In-process FIFO queue implementation with exponential delay execution (zero Redis requirement)
  - [ ] `bull-queue.ts` — Redis-backed BullMQ implementation for horizontally scalable production workloads

- [ ] **7.2 Background Task Workers (`src/jobs/workers/`)**
  - [ ] `news-fetch.worker.ts` — Polling worker querying external feeds for prospective updates
  - [ ] `news-publish.worker.ts` — Asynchronous consumer executing fan-out social publications
  - [ ] `feedback-sync.worker.ts` — Consumer processing pending feedback entries and writing to Google Sheets
  - [ ] `scheduled-news.worker.ts` — Dispatcher evaluating scheduled announcements reaching target timestamp
  - [ ] `retry.worker.ts` — Resilient worker re-attempting failed jobs recorded in `retry_jobs`

- [ ] **7.3 Cron Scheduling Engine (`src/jobs/scheduler/`)**
  - [ ] `cron-scheduler.ts` — Task scheduler driven by `node-cron`:
    - `news-fetch`: `*/15 * * * *` (Every 15 minutes)
    - `scheduled-news`: `* * * * *` (Every 1 minute)
    - `retry`: `*/5 * * * *` (Every 5 minutes)
    - `cleanup`: `0 3 * * *` (Daily at 03:00 UTC)
  - [ ] `src/jobs/index.ts` — Master bootstrap initiating queues, registering workers, and starting cron schedules

---

## Phase 8: Application Bootstrapping and Runtime Lifecycle
> References: [Architecture](docs/architecture.md), [Project Structure](docs/project-structure.md)

- [ ] `src/bot.ts` — Discord bot initialization, gateway authentication, and event binding
- [ ] `src/server.ts` — Express REST API HTTP server initialization and port binding
- [ ] `src/index.ts` — Central runtime supervisor:
  - Validates environment configurations through Zod
  - Initializes Supabase connectivity and validates schema readiness
  - Populates registry instances for publishers and moderation providers
  - Concurrently boots Discord gateway client and Express REST server
  - Starts background queue workers and cron task scheduler
  - Attaches process event handlers for graceful termination (`SIGINT`, `SIGTERM`)

---

## Phase 9: Quality Assurance and Automated Testing
> References: [README.md](README.md), [Architecture](docs/architecture.md)

- [ ] **9.1 Test Infrastructure and Mocks**
  - [ ] `tests/mocks/supabase.mock.ts` — In-memory Supabase client and postgrest query chain mock
  - [ ] `tests/mocks/discord.mock.ts` — Mock Discord client, guild channels, and interaction structures
  - [ ] `tests/mocks/google-sheets.mock.ts` — Google Sheets API mock simulator
  - [ ] `tests/mocks/ai.mock.ts` — Mock implementations of OpenAI and Perspective moderation responses
  - [ ] `tests/mocks/social.mock.ts` — Mock clients for Instagram, X/Twitter, and Reddit APIs
  - [ ] `tests/helpers/factories.ts` — Deterministic test entity generation factories

- [ ] **9.2 Unit Testing Suite (`tests/unit/`)**
  - [ ] `news.service.test.ts` — Validation of draft lifecycle, status guards, and deduplication logic
  - [ ] `publishing.service.test.ts` — Validation of fan-out orchestration and partial failure handling
  - [ ] `moderation.service.test.ts` — Validation of rule provider, leetspeak filters, and decision matrix actions
  - [ ] `feedback.service.test.ts` — Validation of feedback categorization and sheet sync queuing
  - [ ] `retry.test.ts` — Validation of exponential backoff calculation and maximum retry termination

- [ ] **9.3 Integration Testing Suite (`tests/integration/`)**
  - [ ] `news.api.test.ts` — End-to-end HTTP tests on `/api/v1/news` endpoints
  - [ ] `feedback.api.test.ts` — End-to-end HTTP tests on `/api/v1/feedback` endpoints
  - [ ] `games.api.test.ts` — End-to-end HTTP tests on `/api/v1/games` endpoints
  - [ ] `auth.middleware.test.ts` — Validation of Bearer token extraction, SHA-256 comparison, and RBAC rejection

- [ ] **9.4 End-to-End Workflow Verification (`tests/e2e/`)**
  - [ ] `news-publish-flow.test.ts` — Lifecycle verification: Ingestion -> Draft -> Approval -> Fan-out delivery
  - [ ] `feedback-pipeline.test.ts` — Lifecycle verification: Modal submission -> Supabase storage -> Google Sheets sync
  - [ ] `moderation-pipeline.test.ts` — Lifecycle verification: Message ingestion -> Rule matching -> Action dispatch -> Audit logging

---

## Phase 10: DevOps, Containerization, and Deployment
> References: [Deployment Guide](docs/deployment.md)

- [ ] `Dockerfile` — Multi-stage Alpine containerization separating build dependencies from minimal production runtime
- [ ] `docker-compose.yml` — Container orchestration configuration with service definitions for application and optional Redis
- [ ] `ecosystem.config.js` — PM2 runtime specification enforcing resource limits and automated clustering
- [ ] `.github/workflows/ci.yml` — Continuous Integration pipeline executing type checking, linting, and Vitest test suites
- [ ] Production audit verifying adherence to the [Deployment Production Checklist](docs/deployment.md#production-checklist)

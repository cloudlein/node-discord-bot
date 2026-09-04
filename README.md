# Game Community Bot

A production-ready, modular game community management platform built with **Node.js**, **TypeScript**, **Discord.js**, and **Supabase**. Features multi-platform news publishing, AI-powered moderation, customer feedback management, and a RESTful API — all designed with clean architecture principles.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Overview](#database-overview)
- [REST API](#rest-api)
- [Discord Slash Commands](#discord-slash-commands)
- [Core Systems](#core-systems)
- [Installation & Quick Start](#installation--quick-start)
- [Environment Variables](#environment-variables)
- [Development & Scripts](#development--scripts)
- [Testing](#testing)
- [Documentation Directory](#documentation-directory)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Game Community Bot is a centralized platform that manages game community operations across multiple channels. Discord serves as the primary interface, but the system is architected so that **Discord is just one client** — business logic lives independently of any platform SDK.

### Core Principles

1. **Discord is a client, not the core** — business logic never depends on Discord.js directly.
2. **News system is the core domain** — fetching, processing, and publishing are separate concerns.
3. **Adapter/Provider pattern everywhere** — publishers, moderation providers, and news sources are swappable.
4. **Simple now, scalable later** — starts as a single service, but module boundaries allow independent extraction.
5. **Fail gracefully** — platform failures are independent; one external failure never blocks other operations.

---

## Features

### Mandatory Features

| Feature | Description |
|---|---|
| **Game News Announcement** | Fetch, draft, review, and publish game news with deduplication and scheduling |
| **Multi-Platform Publishing** | Publish news to Discord, Instagram, and X/Twitter via adapter pattern |
| **Customer Service / Feedback** | Collect kritik, saran, bug reports, and complaints — saved to Supabase, synced to Google Sheets |
| **Bad Word / Toxicity Filter** | Hybrid moderation: rule-based filtering + AI-powered content analysis |
| **REST API** | Full CRUD API with auth, validation, rate limiting, and versioning |
| **Supabase Database** | Structured persistence with 12 tables, relationships, indexes, and RLS |
| **Google Sheets Integration** | Automatic feedback sync with exponential backoff retry on failure |

### Optional Features

| Feature | Description |
|---|---|
| **AI Moderation** | Context-aware content moderation via OpenAI / Perspective API |
| **Reddit Publishing** | Reddit adapter for cross-posting announcements |
| **Advanced Scheduling** | Cron-based scheduled publishing for planned announcements |
| **Analytics** | Moderation stats, publishing success metrics |
| **Dashboard** | Web-based admin dashboard |
| **Queue System** | BullMQ + Redis support for high-throughput production job processing |

---

## Architecture

This project uses **Modular Clean Architecture** with **Hexagonal (Ports & Adapters)** influences.

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        Discord["Discord Bot (Commands & Events)"]
        API["REST API (Express Routes)"]
        Cron["Cron Jobs (Scheduled Tasks)"]
    end

    subgraph Application["Application Layer"]
        NewsService["News Service"]
        FeedbackService["Feedback Service"]
        ModerationService["Moderation Service"]
        PublishingService["Publishing Service"]
    end

    subgraph Domain["Domain Layer"]
        Interfaces["Interfaces / Ports"]
        Types["Types & DTOs"]
        Errors["Custom Errors"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        Supabase["Supabase Repositories"]
        Publishers["Publishers (Discord, IG, X, Reddit)"]
        ModerationProviders["Moderation Providers"]
        GoogleSheets["Google Sheets Integration"]
    end

    Discord --> Application
    API --> Application
    Cron --> Application
    Application --> Domain
    Application --> Infrastructure
    Domain -.->|defines ports| Infrastructure
```

For complete architecture decisions, sequence diagrams, and end-to-end system flows, see [Architecture & System Flow](docs/architecture.md).

---

## Project Structure

The project separates concerns into clean, modular layers:

```
node-discord-bot/
├── src/
│   ├── index.ts              # Entry point - bootstraps bot and API
│   ├── bot.ts                # Discord client initialization and events
│   ├── server.ts             # Express REST API setup
│   ├── config/               # Environment validation (Zod) and constants
│   ├── shared/               # Cross-cutting types, errors, interfaces, and utils
│   ├── modules/              # Core business logic (games, news, feedback, mod)
│   ├── integrations/         # External adapters (Discord, Google Sheets, AI, Social)
│   ├── api/                  # Express REST routes (/api/v1)
│   └── jobs/                 # Queue abstractions, worker pools, and cron schedules
├── supabase/
│   └── migrations/           # 12 PostgreSQL schema migrations
├── docs/                     # Detailed architectural and API documentation
└── tests/                    # Unit, integration, and E2E test suites
```

For the comprehensive file tree and directory roles, see [Project Structure Guide](docs/project-structure.md).

---

## Database Overview

Persistence is handled by PostgreSQL via Supabase with Row Level Security (RLS) enabled on all 12 tables:

- **Core Tables**: `games`, `news`, `news_publications`, `feedback`, `moderation_logs`
- **Config Tables**: `guild_configs`, `channel_mappings`, `platform_configs`, `bad_words`, `admin_users`
- **Job Tables**: `scheduled_news`, `retry_jobs`

For the Entity Relationship Diagram (ERD), table specifications, and security policies, see [Database Architecture](docs/database.md).

---

## REST API

The Express-based REST API runs under `/api/v1` and requires Bearer token authentication:

```http
Authorization: Bearer <API_KEY>
```

### Key Endpoints

- `POST /api/v1/news` - Create draft news article
- `POST /api/v1/news/:id/publish` - Publish news to all enabled platforms
- `GET /api/v1/feedback` - List feedback with filters
- `POST /api/v1/feedback` - Ingest user feedback
- `GET /api/v1/games` - Retrieve game catalog
- `GET /api/v1/health` - Service health check

For full endpoint documentation, payload schemas, error formats, and rate limits, see [REST API Documentation](docs/api.md).

---

## Discord Slash Commands

| Command | Description | Required Permission |
|---|---|---|
| `/news list` | List recent news articles | Everyone |
| `/news publish <id>` | Publish news article across platforms | Admin |
| `/news create` | Create news draft via modal form | Editor |
| `/feedback` | Submit feedback (opens interactive modal) | Everyone |
| `/report` | Quick bug report shortcut | Everyone |
| `/config channel <game> <channel>` | Map game to announcement channel | Admin |
| `/config moderation <on/off>` | Toggle automated moderation | Admin |
| `/config ai-moderation <on/off>` | Toggle AI-assisted moderation | Admin |
| `/moderation stats` | View guild moderation metrics | Moderator |
| `/moderation manage` | Manage prohibited words list | Admin |
| `/help` | Show bot help and command guide | Everyone |

---

## Core Systems

Detailed specifications for individual subsystems are documented in `docs/`:

- **[Multi-Platform Publishing](docs/publishing.md)**: Adapter pattern for fan-out publishing to Discord, Instagram, X/Twitter, and Reddit with independent failure handling.
- **[Moderation System](docs/moderation.md)**: Hybrid provider chain combining fast rule-based filters (<1ms) with context-aware AI verification.
- **[Customer Service & Feedback](docs/customer-service.md)**: Modal ingestion, Supabase storage, Google Sheets sync, and exponential backoff retry worker.
- **[Background Jobs & Workers](docs/background-jobs.md)**: Queue abstraction with `MemoryQueue` (default) and `BullMQ` (Redis) support.
- **[Security & Privacy](docs/security.md)**: API authentication, data minimization, secret redaction, and RLS guidelines.
- **[Error Handling & Logging](docs/error-handling-and-logging.md)**: Custom error hierarchy, centralized middleware, and Winston JSON structured logging.

---

## Installation & Quick Start

### Prerequisites

- **Node.js** 20+ LTS
- **npm** 9+
- **Supabase** project (free tier works)
- **Discord Bot** application token ([Discord Developer Portal](https://discord.com/developers/applications))

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/game-community-bot.git
cd game-community-bot

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Apply database migrations
# Run SQL files in supabase/migrations/*.sql via Supabase dashboard or CLI:
npx supabase db push

# 5. Register Discord slash commands
npm run deploy-commands

# 6. Start in development mode
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required credentials:

```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Discord
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI Moderation (Optional)
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key

# API Security
API_SECRET_KEY=your_secret_key_for_signing
```

---

## Development & Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start bot and REST API in watch mode (`tsx watch`) |
| `npm run dev:api` | Start only the Express REST API server |
| `npm run dev:bot` | Start only the Discord bot client |
| `npm run build` | Compile TypeScript into production bundle in `dist/` |
| `npm run start` | Run compiled JavaScript output |
| `npm run deploy-commands` | Register slash commands with Discord API |
| `npm run seed` | Populate database with initial games and configuration data |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint static code analysis |
| `npm run format` | Format codebase using Prettier |
| `npm run test` | Run complete Vitest test suite |

---

## Testing

Testing is implemented with **Vitest** across three levels:

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Generate code coverage report
npm run test:coverage
```

All external dependencies (Supabase, Discord.js, Google Sheets, AI providers) are mocked via `tests/mocks/` to guarantee deterministic and isolated test runs.

---

## Documentation Directory

| Document | Description |
|---|---|
| [Architecture & System Flow](docs/architecture.md) | Modular architecture, layer diagram, and 5 detailed system flows |
| [Database Schema & ERD](docs/database.md) | ERD diagram, 12 table specifications, indexes, and RLS policies |
| [REST API Reference](docs/api.md) | Complete endpoints, request/response examples, and rate limits |
| [Project Structure](docs/project-structure.md) | Comprehensive directory tree and module responsibilities |
| [Multi-Platform Publishing](docs/publishing.md) | SocialPublisher port, adapter implementations, fan-out logic |
| [Moderation System](docs/moderation.md) | Hybrid rule-based & AI pipeline, decision matrix, cost reduction |
| [Customer Service / Feedback](docs/customer-service.md) | Feedback intake, Google Sheets sync, privacy rules, retry worker |
| [Background Jobs & Workers](docs/background-jobs.md) | Job queue interface, memory vs BullMQ, cron schedules |
| [Deployment Guide](docs/deployment.md) | Production checklist, multi-stage Dockerfile, PM2, and hosting |
| [Security & Privacy](docs/security.md) | Secrets management, API authentication, Discord permissions, RLS |
| [Error Handling & Observability](docs/error-handling-and-logging.md) | Error classes, centralized middleware, Winston structured logging |

---

## Contributing

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
2. Implement your changes following project conventions:
   - Business logic belongs in `src/modules/`, not in Discord handlers or Express routes.
   - External service calls belong in `src/integrations/`.
   - Adhere to [Conventional Commits](https://www.conventionalcommits.org/).
3. Run verification before committing:
   ```bash
   npm run typecheck && npm run lint && npm run test
   ```
4. Open a Pull Request for review.

---

## License

This project is licensed under the [MIT License](LICENSE).

# Architecture & System Flow

This document details the architectural decisions, design patterns, layer hierarchy, and end-to-end system flows of the Game Community Bot platform.

---

## Architecture Decision

This project uses **Modular Clean Architecture** with **Hexagonal (Ports & Adapters)** influences:

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Monolithic MVC | Simple, fast start | Poor separation, platform-coupled | Rejected |
| Full Microservices | Independent scaling | Over-engineered for initial stage | Rejected |
| **Modular Monolith + Ports/Adapters** | **Clean boundaries, testable, scalable later** | **Slightly more initial setup** | Selected |
| Full DDD | Rich domain model | Too heavyweight for this scope | Rejected |

### Why this works:
- Multi-platform publishing demands an adapter pattern (swap publishers without touching core business logic).
- AI moderation needs provider abstraction (swap OpenAI for Perspective without code changes).
- Single deployable initially, but each module boundary serves as an extraction point for microservices in the future.
- Business logic is 100% testable without mocking Discord.js, Supabase, or external SDKs.

---

## Layer Diagram

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        Discord["Discord Bot<br/>(Commands & Events)"]
        API["REST API<br/>(Express Routes)"]
        Cron["Cron Jobs<br/>(Scheduled Tasks)"]
    end

    subgraph Application["Application Layer"]
        NewsService["News Service"]
        FeedbackService["Feedback Service"]
        ModerationService["Moderation Service"]
        PublishingService["Publishing Service"]
        GameService["Game Service"]
        GuildConfigService["Guild Config Service"]
    end

    subgraph Domain["Domain Layer"]
        Interfaces["Interfaces / Ports"]
        Types["Types & DTOs"]
        Errors["Custom Errors"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        Supabase["Supabase<br/>Repositories"]
        Publishers["Publishers<br/>(Discord, IG, X, Reddit)"]
        ModerationProviders["Moderation Providers<br/>(RuleBased, OpenAI)"]
        GoogleSheets["Google Sheets<br/>Integration"]
        AIClient["AI Client<br/>Integration"]
    end

    Discord --> Application
    API --> Application
    Cron --> Application
    Application --> Domain
    Application --> Infrastructure
    Domain -.->|defines ports| Infrastructure
```

### Dependency Flow

```
Presentation -> Application -> Domain <- Infrastructure
                                ^
                        (implements interfaces)
```

> **Key Rule:** Infrastructure implements interfaces defined in the Domain layer (Dependency Inversion). The Application layer orchestrates business logic. The Presentation layer handles I/O adaptation.

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant C as Client (Discord/API)
    participant H as Handler/Route
    participant S as Module Service
    participant R as Repository
    participant I as Integration
    participant DB as Supabase

    C->>H: Request/Event
    H->>H: Validate & Parse
    H->>S: Call service method
    S->>R: Query/Persist data
    R->>DB: SQL operation
    DB-->>R: Result
    S->>I: External call (if needed)
    I-->>S: Response
    S-->>H: Business result
    H-->>C: Formatted response
```

---

## System Flows

### 1. Game News Flow

```mermaid
flowchart TD
    A["News Source<br/>(RSS / API / Manual)"] --> B["NewsSourceService<br/>fetch & parse"]
    B --> C["NewsService<br/>deduplicate & validate"]
    C --> D{"Duplicate?"}
    D -->|Yes| E["Skip"]
    D -->|No| F["Save as DRAFT<br/>to Supabase"]
    F --> G["Admin Review"]
    G --> H{"Approve?"}
    H -->|No| I["Edit Draft"]
    I --> G
    H -->|Yes| J["Status -> READY"]
    J --> K{"Scheduled?"}
    K -->|Yes| L["ScheduledNews<br/>Wait for scheduled_at"]
    K -->|No| M["PublishingService<br/>publishToAllPlatforms()"]
    L -->|Time reached| M
    M --> N["PublisherRegistry<br/>get enabled platforms"]
    N --> O["Discord Publisher"]
    N --> P["Instagram Publisher"]
    N --> Q["X/Twitter Publisher"]
    N --> Q2["Reddit Publisher"]
    O --> R["news_publications<br/>(status per platform)"]
    P --> R
    Q --> R
    Q2 --> R

    style F fill:#f9f,stroke:#333
    style M fill:#bbf,stroke:#333
```

**Key Points:**
- News always starts as **DRAFT** to prevent accidental publishing.
- Deduplication is handled via `external_id` (article URL or external ID).
- Each platform publish is **independent**; one failure never blocks others.
- Failed publishes automatically create retry jobs in `retry_jobs`.
- Per-platform status is tracked in `news_publications`.

---

### 2. Customer Service / Feedback Flow

```mermaid
flowchart TD
    A["Discord User"] -->|"/feedback or /report"| B["Discord Bot"]
    B --> C["FeedbackService<br/>validate & categorize"]
    C --> D["Save to Supabase<br/>(feedback table)"]
    D --> E["Queue Google Sheets Sync"]
    E --> F{"Sheets API Available?"}
    F -->|Yes| G["Append to Google Sheets"]
    F -->|No| H["Create Retry Job"]
    H --> I["RetryWorker<br/>(exponential backoff)"]
    I -->|Retry| F
    G --> J["Update synced_to_sheets = true"]
    D --> K["Reply to user with confirmation"]

    style D fill:#f9f,stroke:#333
    style G fill:#bfb,stroke:#333
    style H fill:#fbb,stroke:#333
```

**Key Points:**
- Data is **always saved to Supabase first**; Google Sheets failure never results in lost feedback.
- Retries use exponential backoff (1s -> 2s -> 4s up to 30s max).
- Metadata captured: user ID, username, game, category, message, timestamp, status.
- Privacy: Personal data is not exposed; Supabase RLS protects access.

---

### 3. Moderation Flow

```mermaid
flowchart TD
    A["Discord Message"] --> B["messageCreate Event"]
    B --> C["ModerationService<br/>analyzeMessage()"]
    C --> D["Step 1: RuleBasedProvider"]
    D --> E{"Match Found?"}
    E -->|"HIGH confidence"| F["Immediate Action"]
    E -->|"LOW/uncertain"| G{"AI Enabled?"}
    E -->|"No match"| H["Allow Message"]
    G -->|Yes| I["Step 2: AI Provider<br/>(OpenAI / Perspective)"]
    G -->|No| H
    I --> J{"AI Decision"}
    J -->|Toxic| F
    J -->|Safe| H
    F --> K["Execute Action"]
    K --> L["Delete Message"]
    K --> M["Warning"]
    K --> N["Timeout"]
    K --> O["Auto Ban"]
    K --> P["Escalate to Mod"]
    K --> Q["Log to moderation_logs"]

    style F fill:#fbb,stroke:#333
    style H fill:#bfb,stroke:#333
```

**Key Points:**
- **Hybrid approach**: Rule-based first (fast, free, under 1ms), AI second (only if uncertain or enabled).
- AI is not executed for every message, which drastically reduces API latency and cost.
- Provider abstraction allows changing AI providers without altering core moderation logic.

---

### 4. Multi-Platform Publishing Flow

```mermaid
flowchart LR
    A["Game News"] --> B["PublishingService"]
    B --> C["PublisherRegistry"]
    C --> D{"Get Enabled<br/>Platforms"}
    D --> E["DiscordPublisher"]
    D --> F["InstagramPublisher"]
    D --> G["XPublisher"]
    D --> H["RedditPublisher"]

    E -->|"Success / Failed"| I["news_publications<br/>(discord)"]
    F -->|"Success / Failed"| J["news_publications<br/>(instagram)"]
    G -->|"Success / Failed"| K["news_publications<br/>(x)"]
    H -->|"Success / Failed"| L["news_publications<br/>(reddit)"]

    I --> M{"Failed?"}
    J --> M
    K --> M
    L --> M
    M -->|Yes| N["Create RetryJob"]
    M -->|No| O["Done"]

    style E fill:#7289da,stroke:#333,color:#fff
    style F fill:#E1306C,stroke:#333,color:#fff
    style G fill:#1DA1F2,stroke:#333,color:#fff
    style H fill:#FF4500,stroke:#333,color:#fff
```

---

### 5. REST API Flow

```mermaid
flowchart TD
    A["HTTP Request"] --> B["Express Router"]
    B --> C["Auth Middleware<br/>(API Key / JWT)"]
    C --> D["Rate Limit Middleware"]
    D --> E["Validation Middleware<br/>(Zod)"]
    E --> F["Route Handler"]
    F --> G["Module Service"]
    G --> H["Repository / Integration"]
    H --> I["Supabase / External"]
    I --> J["Response"]
    J --> K["Logging Middleware"]
    K --> L["JSON Response"]

    C -->|"401"| M["Unauthorized"]
    D -->|"429"| N["Rate Limited"]
    E -->|"400"| O["Validation Error"]
    F -->|"500"| P["Error Handler Middleware"]

    style C fill:#ff9,stroke:#333
    style D fill:#ff9,stroke:#333
    style E fill:#ff9,stroke:#333
```

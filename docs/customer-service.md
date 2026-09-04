# Customer Service & Feedback

This document details the feedback pipeline, Discord modal interaction, Google Sheets synchronization, retry mechanisms, and user privacy safeguards.

---

## Feedback Categories

The bot ingests user feedback across 5 formal classifications:

| Category | Description | Typical Use Case |
|---|---|---|
| `kritik` | Constructive critique | Community feedback regarding game mechanics or rules |
| `saran` | Feature suggestions | Player ideas for content updates or bot improvements |
| `bug` | Bug reports | Error descriptions, steps to reproduce, glitches |
| `feedback` | General feedback | General impressions and satisfaction reports |
| `complaint` | Grievances | Player complaints regarding service or account issues |

---

## Data Ingestion Flow

```
Discord User -> /feedback or /report -> Modal Form
                                              |
                                     FeedbackService.create()
                                              |
                        +---------------------+---------------------+
                        |                                           |
                  Save to Supabase                            Queue Sync Job
                 (feedback table)                                   |
                        |                                   FeedbackSyncWorker
                 Always succeeds                                    |
                                                      +-------------+-------------+
                                                      |                           |
                                                  Success                      Failure
                                                      |                           |
                                            Update synced=true             Create RetryJob
                                                                        (exponential backoff)
```

---

## Google Sheets Integration

Each feedback entry is synced to a dedicated Google Sheet with the following format:

| Column | Source | Format / Notes |
|---|---|---|
| ID | `feedback.id` | UUID string |
| Timestamp | `feedback.created_at` | ISO 8601 |
| Category | `feedback.category` | kritik / saran / bug / feedback / complaint |
| Game | `games.name` | Resolved from foreign key `game_id` |
| Username | `feedback.username` | Discord username |
| Message | `feedback.message` | Full text submitted by user |
| Status | `feedback.status` | new / reviewed / resolved / archived |
| Guild | Guild Name | Resolved from `guild_id` |

---

## Resilience & Retry Strategy

If the Google Sheets API experiences latency, rate limits, or connectivity issues:

- Feedback is **always secured in the Supabase database first**.
- A retry job is automatically recorded in `retry_jobs`.
- The `RetryWorker` attempts synchronization with exponential backoff:
  - Base delay: 1,000 ms (1 second)
  - Multiplier: 2x (1s -> 2s -> 4s)
  - Maximum backoff: 30,000 ms (30 seconds)
  - Maximum attempts: 3 retries
- Once retries are exhausted, the job status is set to `dead`, alerting administrators without losing any customer submission.

---

## Privacy & Security

- No phone numbers, email addresses, or personal contact info are gathered.
- Discord snowflake IDs are retained for internal deduplication and moderation audits, but omitted from non-essential third-party views.
- Supabase Row Level Security (RLS) protects the feedback repository against unauthorized reads.

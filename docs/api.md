# REST API Documentation

This document provides a complete reference for the Game Community Bot REST API, including authentication, endpoints, request/response formats, error structures, and rate limits.

---

## Base URL

```
http://localhost:3000/api/v1
```

---

## Authentication

All API endpoints require authentication via Bearer token (API key):

```http
Authorization: Bearer <API_KEY>
```

API keys are hashed with SHA-256 and verified against the `admin_users` table. User roles (`superadmin`, `admin`, `editor`) govern access permissions.

---

## Endpoints

### 1. News Endpoints

| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/v1/news` | Create a new draft news article | Admin+ |
| `GET` | `/api/v1/news` | List news with pagination and filters | Editor+ |
| `GET` | `/api/v1/news/:id` | Get news article by ID | Editor+ |
| `PUT` | `/api/v1/news/:id` | Update news article | Editor+ |
| `DELETE` | `/api/v1/news/:id` | Soft delete news article | Admin+ |
| `POST` | `/api/v1/news/:id/publish` | Publish news to all enabled platforms | Admin+ |
| `POST` | `/api/v1/news/:id/publish/discord` | Publish news to Discord only | Admin+ |
| `POST` | `/api/v1/news/:id/publish/social` | Publish news to all social platforms | Admin+ |
| `PATCH` | `/api/v1/news/:id/status` | Update status (e.g. draft -> ready) | Editor+ |

#### Request Examples:

**Create News (`POST /api/v1/news`)**
```http
POST /api/v1/news
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "game_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Patch 2.5 Release Notes",
  "content": "Major balance changes and new hero announced...",
  "summary": "Balance patch with new hero",
  "url": "https://game.com/patch-2-5",
  "image_url": "https://cdn.game.com/patch-2-5.jpg",
  "source": "official",
  "scheduled_at": "2026-09-10T12:00:00Z"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "status": "draft",
    "title": "Patch 2.5 Release Notes",
    "created_at": "2026-09-05T00:00:00Z"
  }
}
```

**Publish News (`POST /api/v1/news/:id/publish`)**
```http
POST /api/v1/news/a1b2c3d4-.../publish
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "platforms": ["discord", "instagram", "x"]
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "news_id": "a1b2c3d4-...",
    "results": [
      { "platform": "discord", "status": "success", "external_post_id": "1234567890" },
      { "platform": "instagram", "status": "success", "external_post_id": "IG_POST_123" },
      { "platform": "x", "status": "failed", "error": "Rate limit exceeded" }
    ]
  }
}
```

---

### 2. Feedback Endpoints

| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/v1/feedback` | Submit feedback (webhook or client) | Public* |
| `GET` | `/api/v1/feedback` | List feedback with query filters | Editor+ |
| `GET` | `/api/v1/feedback/:id` | Get feedback details by ID | Editor+ |
| `PATCH` | `/api/v1/feedback/:id/status` | Update feedback status | Editor+ |
| `POST` | `/api/v1/feedback/:id/sync` | Manually retry Google Sheets sync | Admin+ |

*Public endpoints are rate-limited per IP and can be gated by signature or secret.

---

### 3. Games Endpoints

| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/api/v1/games` | Create a new game in catalog | Admin+ |
| `GET` | `/api/v1/games` | List all registered games | Editor+ |
| `GET` | `/api/v1/games/:id` | Get game details by ID | Editor+ |
| `PUT` | `/api/v1/games/:id` | Update game details | Admin+ |
| `DELETE` | `/api/v1/games/:id` | Deactivate game | Admin+ |

---

### 4. Platforms & Health

| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `GET` | `/api/v1/platforms` | List platform configurations | Admin+ |
| `PATCH` | `/api/v1/platforms/:platform` | Update platform settings / toggle | Admin+ |
| `GET` | `/api/v1/health` | Service health status check | None (Public) |

---

## Error Response Format

All error responses adhere to a consistent JSON envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "title", "message": "Title is required" }
    ],
    "requestId": "req_abc123"
  }
}
```

Common Error Codes:
- `VALIDATION_ERROR` (400)
- `AUTHENTICATION_ERROR` (401)
- `AUTHORIZATION_ERROR` (403)
- `NOT_FOUND` (404)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)
- `INTEGRATION_ERROR` (502)

---

## Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| Global API | 100 requests | per minute per API key |
| Publishing endpoints | 10 requests | per minute per API key |
| Public endpoints | 30 requests | per minute per IP |

Headers returned:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1693872000
```

# Error Handling & Observability

This document describes the application error taxonomy, central error middleware, structured logging with Winston, and monitoring practices.

---

## Error Class Hierarchy

All domain, validation, and integration errors extend from a base `AppError`:

```
AppError (base)                          // code, message, statusCode, context, timestamp
├── ValidationError                      // 400 - Invalid user or schema input
├── AuthenticationError                  // 401 - Invalid/missing API key or token
├── AuthorizationError                   // 403 - Insufficient permission level
├── NotFoundError                        // 404 - Requested resource does not exist
├── DatabaseError                        // 500 - Supabase query or connectivity failure
├── IntegrationError                     // 502 - External provider failure
│   ├── GoogleSheetsError                //       Google Sheets API failure
│   └── SocialPlatformError             //       Social platform API failure
├── PublishingError                      // 502 - News fan-out delivery failure
└── ModerationError                      // 500 - Moderation pipeline processing failure
```

---

## Centralized Express Middleware

```typescript
// Express error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      requestId: req.id,
      context: err.context,
    });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId: req.id,
      },
    });
  }

  // Unexpected runtime exceptions
  logger.error('Unexpected error', { error: err, requestId: req.id });
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred',
      requestId: req.id,
    },
  });
});
```

---

## Integration Failure Strategy

| Component | Failure Handling | Retry Policy | Fallback |
|---|---|---|---|
| Supabase DB | Throw `DatabaseError` | 2 retries, 1s backoff | None (critical path) |
| Discord Gateway | Log error, queue interaction response | 3 retries, 2s backoff | Queue for background retry |
| Google Sheets | Create retry job in `retry_jobs` | 3 retries, exponential backoff | Data remains intact in Supabase |
| Social APIs (X, IG) | Log error, record failure status | 3 retries, 5s backoff | Other active platforms still publish |
| AI Moderation | Catch error and log | 1 immediate retry | Fallback directly to RuleBasedProvider |

---

## Structured Logging with Winston

Every log statement outputs formatted JSON containing operational context:

```json
{
  "level": "info",
  "timestamp": "2026-09-05T00:00:00.000Z",
  "service": "publishing-service",
  "requestId": "req_abc123",
  "correlationId": "cor_xyz789",
  "message": "News published successfully",
  "metadata": {
    "newsId": "550e8400-...",
    "platform": "discord",
    "channelId": "1234567890",
    "duration": 245
  }
}
```

### Contextual Fields
- `requestId`: Unique correlation identifier per HTTP request.
- `correlationId`: Links multi-step transactions across jobs and services.
- `service`: Name of the triggering domain service.
- `duration`: Execution time in milliseconds for performance telemetry.

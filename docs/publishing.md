# Multi-Platform Publishing

This document describes the design, interfaces, and extension mechanisms of the multi-platform publishing engine.

---

## Architecture

The publishing system uses the **Adapter Pattern** to deliver game news to various social networks and messaging platforms seamlessly:

```typescript
// src/shared/interfaces/publisher.interface.ts

interface SocialPublisher {
  /** Unique platform identifier */
  readonly platform: string;

  /** Publish a news article to this platform */
  publish(news: NewsDTO, options?: PublishOptions): Promise<PublishResult>;

  /** Validate that this publisher is properly configured */
  validate(): Promise<boolean>;

  /** Format news content for this specific platform */
  formatContent(news: NewsDTO): PlatformContent;
}

interface PublishResult {
  platform: string;
  status: 'success' | 'failed';
  externalPostId?: string;
  error?: string;
  publishedAt?: Date;
}

interface PublishOptions {
  channelId?: string;        // Discord-specific channel
  hashtags?: string[];       // Social media tags
  scheduledAt?: Date;        // Scheduled publishing time
}
```

---

## Publisher Registry

The `PublisherRegistry` holds all available platform publishers and controls which ones are active:

```typescript
// src/modules/publishing/publisher.registry.ts

class PublisherRegistry {
  private publishers: Map<string, SocialPublisher>;

  register(publisher: SocialPublisher): void;
  get(platform: string): SocialPublisher | undefined;
  getEnabled(): SocialPublisher[];
  isEnabled(platform: string): boolean;
}
```

### Registered Publishers

- **DiscordPublisher**: Formats rich embeds and posts to mapped game announcement channels.
- **InstagramPublisher**: Uploads photo/caption posts via the Instagram Graph API.
- **XPublisher**: Tweets announcements via Twitter API v2.
- **RedditPublisher** *(optional)*: Submits link/text posts to designated subreddits.

---

## Publish Orchestration

When a news item is published, `PublishingService` coordinates fan-out execution:

```typescript
// src/modules/publishing/publishing.service.ts

class PublishingService {
  async publishToAllPlatforms(newsId: string, platforms?: string[]): Promise<PublishReport> {
    const news = await this.newsRepository.findById(newsId);

    // Determine target publishers
    const targets = platforms
      ? platforms.map(p => this.registry.get(p)).filter(Boolean)
      : this.registry.getEnabled();

    // Fan-out independently (one failure does not block others)
    const results = await Promise.allSettled(
      targets.map(publisher => this.publishToSingle(publisher, news))
    );

    // Save publication records to Supabase
    await this.storePublicationRecords(newsId, results);

    // Enqueue automatic retries for failed platforms
    await this.queueRetries(newsId, results);

    return this.buildReport(results);
  }
}
```

---

## Adding a New Platform Adapter

To integrate a new destination (e.g., Telegram, Facebook):

1. Create the API client adapter under `src/integrations/social/<platform>/<platform>.client.ts`.
2. Implement the `SocialPublisher` interface in `src/modules/publishing/publishers/<platform>.publisher.ts`.
3. Register the new publisher inside `PublisherRegistry`.
4. Add the platform configuration entry to the `platform_configs` database table.
5. No changes to `PublishingService` or other platform adapters are required.

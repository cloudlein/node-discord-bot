# Moderation System

This document outlines the hybrid moderation architecture, provider chain, decision matrix, cost optimization strategy, and media filtering capabilities.

---

## Provider Chain Architecture

The moderation system follows a **Chain of Responsibility / Provider Chain** pattern:

```typescript
// src/shared/interfaces/moderation-provider.interface.ts

interface ModerationProvider {
  /** Provider identifier */
  readonly name: string;

  /** Priority (lower value = executed first) */
  readonly priority: number;

  /** Check content for violations */
  check(content: ModerationInput): Promise<ModerationResult>;

  /** Whether this provider can handle the input type */
  canHandle(input: ModerationInput): boolean;
}

interface ModerationInput {
  text?: string;
  mediaUrl?: string;
  userId: string;
  guildId: string;
  channelId: string;
}

interface ModerationResult {
  provider: string;
  isViolation: boolean;
  confidence: number;         // 0.0 to 1.0
  categories: string[];       // e.g. ['profanity', 'harassment']
  matchedTerms?: string[];
  suggestedAction: ModerationAction;
}

type ModerationAction = 'allow' | 'log' | 'delete' | 'warn' | 'timeout' | 'ban' | 'escalate';
```

---

## Moderation Providers

1. **RuleBasedProvider (Priority: 1)**
   - High speed (<1ms), zero external API cost.
   - Exact word matching, regex pattern checking, word boundary isolation.
   - Leet-speak normalization (e.g., `b@d` -> `bad`).
   - Dynamic wordlist cached in-memory from the `bad_words` table.

2. **OpenAIProvider (Priority: 10, Optional)**
   - Context-aware text moderation endpoint.
   - Multimodal image/media analysis for sensitive media.
   - Only invoked when rule-based filters encounter borderline confidence.

3. **PerspectiveProvider (Priority: 10, Optional)**
   - Google Perspective API toxicity scoring.
   - Multi-language toxicity and harassment analysis.

---

## Decision Matrix

| Severity | Confidence | Automated Action |
|---|---|---|
| Low | Any | `log` - Record in database, no disruption |
| Medium | > 0.7 | `delete` - Remove offending message |
| Medium | > 0.9 | `warn` - Delete message and send direct message warning |
| High | > 0.5 | `delete` + `warn` |
| High | > 0.8 | `timeout` - Temporary mute in Discord server |
| Critical | > 0.5 | `ban` + `escalate` - Server ban and moderator alert |

---

## Cost Optimization Flow

```
Incoming Discord Message
         |
RuleBasedProvider.check()      <-- FREE, execution time < 1ms
    |
    +---> HIGH confidence violation  --> Immediate action (AI bypassed)
    +---> Clear / Safe               --> Message allowed (AI bypassed)
    +---> Ambiguous / Uncertain      --> Evaluated by AI (if enabled)
                                              |
                                     OpenAI / Perspective API  <-- Only for ambiguous cases
```

---

## Media Moderation

For messages containing images, attachments, or image links:
1. Media URLs are extracted during the `messageCreate` event.
2. URLs and domains are validated against known blocklists.
3. If AI moderation is enabled, URLs are analyzed by the multimodal provider.
4. Results are recorded in `moderation_logs` with `is_media = true`.

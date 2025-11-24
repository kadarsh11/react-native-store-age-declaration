# API Documentation

## Table of Contents

- [Methods](#methods)
  - [getAndroidPlayAgeRangeStatus](#getandroidplayagerangestatus)
- [Types](#types)
  - [PlayAgeRangeStatusResult](#playagerangestatusresult)
- [Error Handling](#error-handling)
- [Platform Support](#platform-support)

---

## Methods

### `getAndroidPlayAgeRangeStatus()`

Retrieves the age range declaration status from Google Play's Age Signals API.

#### Signature

```typescript
function getAndroidPlayAgeRangeStatus(): Promise<PlayAgeRangeStatusResult>
```

#### Parameters

None

#### Returns

`Promise<PlayAgeRangeStatusResult>` - A promise that resolves with the age status information.

#### Description

This method queries Google Play's Age Signals API to determine if the current user is above or below the age threshold configured for your application. The API uses information from:

1. **Family Link** - Parent-managed accounts with age restrictions
2. **Google Account Age** - Age information from the user's Google account
3. **Play Store Declarations** - Self-reported age information

#### Platform Availability

- ✅ **Android** (API Level 21+)
- ❌ **iOS** (Coming soon)

#### Behavior

- **First Call**: Contacts Google Play Services to retrieve age signals
- **Caching**: Results may be cached by Google Play Services
- **Network**: May require internet connection on first call
- **Privacy**: Returns only age status, not actual age
- **Async**: Always returns a Promise (never throws)

#### Example

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function checkAge() {
  const result = await getAndroidPlayAgeRangeStatus();
  
  if (result.error) {
    console.error('Failed to get age status:', result.error);
    return;
  }
  
  switch (result.userStatus) {
    case 'OVER_AGE':
      console.log('User is above age threshold');
      break;
    case 'UNDER_AGE':
      console.log('User is below age threshold');
      break;
    case 'UNKNOWN':
      console.log('Age status could not be determined');
      break;
  }
  
  console.log('Install ID:', result.installId);
}
```

#### Performance

- **First Call**: ~100-500ms (network dependent)
- **Cached Calls**: ~10-50ms
- **Memory**: Minimal (<1KB)

#### Thread Safety

This method is thread-safe and can be called from any thread. The native implementation handles all async operations internally.

---

## Types

### `PlayAgeRangeStatusResult`

The result object returned by `getAndroidPlayAgeRangeStatus()`.

#### Type Definition

```typescript
interface PlayAgeRangeStatusResult {
  installId: string | null;
  userStatus: string | null;
  error: string | null;
}
```

#### Properties

##### `installId`

- **Type**: `string | null`
- **Description**: A unique identifier for this app installation
- **Privacy**: Not linked to user identity or Google account
- **Persistence**: Remains constant across app sessions
- **Value**: UUID-formatted string (e.g., "123e4567-e89b-12d3-a456-426614174000")

**When null:**
- An error occurred during the API call
- Google Play Services is unavailable

**Example:**
```typescript
const result = await getAndroidPlayAgeRangeStatus();
if (result.installId) {
  console.log('Installation ID:', result.installId);
}
```

##### `userStatus`

- **Type**: `string | null`
- **Description**: The age status of the user relative to your app's age threshold

**Possible Values:**

| Value | Meaning | Use Case |
|-------|---------|----------|
| `"OVER_AGE"` | User is at or above the age threshold | Show all content |
| `"UNDER_AGE"` | User is below the age threshold | Show age-appropriate content |
| `"UNKNOWN"` | Age status cannot be determined | Use safe defaults |
| `null` | Error occurred | Handle gracefully |

**When null:**
- An error occurred (check `error` property)
- API call failed

**Example:**
```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.userStatus === 'OVER_AGE') {
  enableAllFeatures();
} else if (result.userStatus === 'UNDER_AGE') {
  enableKidsMode();
} else {
  enableSafeMode(); // UNKNOWN or null
}
```

##### `error`

- **Type**: `string | null`
- **Description**: Error message if the operation failed
- **Value**: Human-readable error description

**When null:**
- Operation succeeded
- Check `installId` and `userStatus` for results

**When present:**
- Operation failed
- `installId` and `userStatus` will be `null`

**Common Error Messages:**

| Error | Meaning | Recovery |
|-------|---------|----------|
| `"AGE_SIGNALS_INIT_ERROR: ..."` | Failed to initialize Age Signals | Check Google Play Services availability |
| Network timeout errors | Connection issues | Retry with exponential backoff |
| Permission errors | App lacks necessary permissions | Verify Play Store installation |

**Example:**
```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.error) {
  if (result.error.includes('AGE_SIGNALS_INIT_ERROR')) {
    showPlayServicesError();
  } else if (result.error.includes('timeout')) {
    retryWithBackoff();
  } else {
    showGenericError(result.error);
  }
}
```

---

## Error Handling

### Error Categories

#### 1. Initialization Errors

**Error Pattern**: `AGE_SIGNALS_INIT_ERROR: ...`

**Causes:**
- Google Play Services not installed
- Google Play Services outdated
- Device doesn't support Age Signals API

**Handling:**
```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.error?.startsWith('AGE_SIGNALS_INIT_ERROR')) {
  // Fallback to manual age verification
  const manualAge = await showAgeInputDialog();
  return manualAge >= 13 ? 'OVER_AGE' : 'UNDER_AGE';
}
```

#### 2. Network Errors

**Causes:**
- No internet connection
- Timeout
- Service temporarily unavailable

**Handling:**
```typescript
async function getAgeStatusWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await getAndroidPlayAgeRangeStatus();
    
    if (!result.error) {
      return result;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  // All retries failed
  return { installId: null, userStatus: 'UNKNOWN', error: null };
}
```

#### 3. Unknown Status

**Not an error**, but requires handling:

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.userStatus === 'UNKNOWN') {
  // User hasn't set up age information
  // Default to safe, age-appropriate content
  showGeneralAudienceContent();
}
```

### Best Practices

1. **Never crash on errors** - Always have a fallback
2. **Log errors** - For debugging and analytics
3. **User-friendly messages** - Don't show technical errors to users
4. **Retry logic** - For transient network errors
5. **Fallback content** - Always have age-appropriate defaults

---

## Platform Support

### Android

#### Requirements

- **Minimum SDK**: API Level 21 (Android 5.0 Lollipop)
- **Target SDK**: API Level 33+ recommended
- **Google Play Services**: Required
- **Distribution**: Full functionality requires Google Play Store distribution

#### Native Dependencies

```gradle
implementation "com.google.android.play:agesignals:1.0.0"
```

Automatically included - no manual setup required.

#### Permissions

No special permissions required. The Age Signals API works within standard app permissions.

#### Testing

**On Emulator:**
- Install Google Play Services
- Sign in with a Google account
- May return `UNKNOWN` if Family Link not set up

**On Physical Device:**
- Best testing with Family Link enabled
- Test with multiple Google accounts
- Verify behavior with no internet

### iOS

**Status**: Coming soon

**Planned Features:**
- App Store age rating integration
- Screen Time API integration
- Family Sharing support

---

## Advanced Usage

### Caching Strategy

```typescript
class AgeStatusManager {
  private cachedResult: PlayAgeRangeStatusResult | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getStatus(forceRefresh = false): Promise<PlayAgeRangeStatusResult> {
    const now = Date.now();
    
    if (!forceRefresh && 
        this.cachedResult && 
        (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedResult;
    }

    this.cachedResult = await getAndroidPlayAgeRangeStatus();
    this.cacheTimestamp = now;
    
    return this.cachedResult;
  }

  clearCache() {
    this.cachedResult = null;
    this.cacheTimestamp = 0;
  }
}
```

### Analytics Integration

```typescript
import analytics from '@react-native-firebase/analytics';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function trackAgeStatus() {
  const result = await getAndroidPlayAgeRangeStatus();
  
  await analytics().logEvent('age_status_checked', {
    user_status: result.userStatus || 'ERROR',
    has_error: !!result.error,
    platform: 'android'
  });
  
  // Set user property for segmentation
  if (result.userStatus) {
    await analytics().setUserProperty('age_category', result.userStatus);
  }
}
```

### Content Filtering

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

type ContentRating = 'EVERYONE' | 'TEEN' | 'MATURE';

class ContentFilter {
  private allowedRatings: Set<ContentRating> = new Set();

  async initialize() {
    const result = await getAndroidPlayAgeRangeStatus();
    
    switch (result.userStatus) {
      case 'OVER_AGE':
        this.allowedRatings = new Set(['EVERYONE', 'TEEN', 'MATURE']);
        break;
      case 'UNDER_AGE':
        this.allowedRatings = new Set(['EVERYONE']);
        break;
      default:
        // UNKNOWN - be conservative
        this.allowedRatings = new Set(['EVERYONE']);
    }
  }

  isAllowed(rating: ContentRating): boolean {
    return this.allowedRatings.has(rating);
  }

  filterContent<T extends { rating: ContentRating }>(items: T[]): T[] {
    return items.filter(item => this.isAllowed(item.rating));
  }
}
```

---

## FAQs

### Q: How often should I call this API?

**A:** Call once when the app starts, then cache the result. Age status rarely changes during an app session.

### Q: Does this work on all Android devices?

**A:** It requires Google Play Services, which is on most Android devices worldwide. Always have a fallback for devices without it.

### Q: Can I use this for COPPA compliance?

**A:** This can be part of your COPPA compliance strategy, but consult with legal counsel for complete compliance.

### Q: What if the user status is UNKNOWN?

**A:** Default to showing only age-appropriate content suitable for all ages.

### Q: Does this track users?

**A:** No. The `installId` is not linked to user identity and cannot be used for cross-app tracking.

### Q: Do I need special permissions in AndroidManifest.xml?

**A:** No special permissions are required. The library handles everything automatically.

---

## Migration Guide

If you're migrating from another age verification solution:

### From Manual Age Input

```typescript
// Before
const userAge = await showAgeInputDialog();
const isAdult = userAge >= 18;

// After
const result = await getAndroidPlayAgeRangeStatus();
const isAdult = result.userStatus === 'OVER_AGE';
```

### From Device Restrictions API

```typescript
// Before (deprecated)
import { getRestrictions } from 'old-library';
const restrictions = await getRestrictions();

// After
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';
const result = await getAndroidPlayAgeRangeStatus();
```

---

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report a bug](https://github.com/meneetu/ccep-technical-assignment/issues)
- Documentation: [README.md](./README.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

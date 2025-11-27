# Quick Reference Guide

## Installation

```bash
npm install react-native-store-age-declaration
```

## Basic Usage

### Android (Google Play Age Signals)

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

const result = await getAndroidPlayAgeRangeStatus();
```

### iOS (Declared Age Range API)

```typescript
import { requestIOSDeclaredAgeRange } from 'react-native-store-age-declaration';

const result = await requestIOSDeclaredAgeRange(13, 17, 21);
```

## Response Objects

### Android Response

```typescript
{
  installId: string | null,    // Unique installation ID
  userStatus: string | null,   // 'OVER_AGE' | 'UNDER_AGE' | 'UNKNOWN'
  error: string | null         // Error message if failed
}
```

### iOS Response

```typescript
{
  status: string | null,       // 'sharing' | 'declined'
  parentControls: string | null, // Parental control status
  lowerBound: number | null,   // Age range lower bound
  upperBound: number | null    // Age range upper bound
}
```

## Common Patterns

### Check if User is Adult (Cross-Platform)

```typescript
import { Platform } from 'react-native';

async function isAdult() {
  if (Platform.OS === 'android') {
    const result = await getAndroidPlayAgeRangeStatus();
    return result.userStatus === 'OVER_AGE';
  } else if (Platform.OS === 'ios') {
    const result = await requestIOSDeclaredAgeRange(13, 17, 21);
    return result.status === 'sharing' && result.lowerBound >= 18;
  }
  return false;
}
```

### Filter Content by Age (Android)

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.userStatus === 'OVER_AGE') {
  showAllContent();
} else {
  showKidsContent();
}
```

### Filter Content by Age (iOS)

```typescript
const result = await requestIOSDeclaredAgeRange(13, 17, 21);

if (result.status === 'sharing') {
  if (result.lowerBound >= 18) {
    showAllContent();
  } else {
    showKidsContent();
  }
} else {
  showDefaultContent();
}
```

### Handle Errors

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.error) {
  console.error('Error:', result.error);
  // Show default safe content
}
```

### React Hook (Cross-Platform)

```typescript
function useAgeStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      getAndroidPlayAgeRangeStatus()
        .then(setStatus)
        .finally(() => setLoading(false));
    } else if (Platform.OS === 'ios') {
      requestIOSDeclaredAgeRange(13, 17, 21)
        .then(setStatus)
        .finally(() => setLoading(false));
    }
  }, []);

  const isAdult = Platform.OS === 'android'
    ? status?.userStatus === 'OVER_AGE'
    : status?.status === 'sharing' && status?.lowerBound >= 18;

  return { status, loading, isAdult };
}
```

## Status Values

### Android (userStatus)

| Value | Meaning |
|-------|---------|
| `OVER_AGE` | User is above age threshold ✅ |
| `UNDER_AGE` | User is below age threshold 🧒 |
| `UNKNOWN` | Age cannot be determined ❓ |
| `null` | Error occurred ⚠️ |

### iOS (status)

| Value | Meaning |
|-------|---------|
| `sharing` | User agreed to share age ✅ |
| `declined` | User declined to share ❌ |

## Error Types

### Android

| Error | Cause |
|-------|-------|
| `AGE_SIGNALS_INIT_ERROR` | Google Play Services unavailable |
| Network errors | Connection issues |

### iOS

| Error | Cause |
|-------|-------|
| `IOS_VERSION_ERROR` | iOS version below 18.0 |
| `NO_VIEW_CONTROLLER` | Cannot present UI |

## Best Practices

✅ **DO:**
- Cache results (age rarely changes)
- Handle `UNKNOWN` status gracefully
- Provide fallback content
- Use platform checks for cross-platform apps

❌ **DON'T:**
- Don't call repeatedly (use caching)
- Don't crash on errors
- Don't use `installId` for tracking
- Don't show technical errors to users

## Platform Support

- ✅ Android (API 21+) - Google Play Age Signals
- ✅ iOS (18.0+) - Declared Age Range API

## Links

- [Full Documentation](./README.md)
- [API Reference](./API.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Example App](./example/src/App.tsx)

## One-Liner Examples

```typescript
// Android - Simple check
const isAdult = (await getAndroidPlayAgeRangeStatus()).userStatus === 'OVER_AGE';

// iOS - Simple check
const isAdult = (await requestIOSDeclaredAgeRange(13, 17, 21)).lowerBound >= 18;

// Cross-platform
const isAdult = Platform.OS === 'android'
  ? (await getAndroidPlayAgeRangeStatus()).userStatus === 'OVER_AGE'
  : (await requestIOSDeclaredAgeRange(13, 17, 21)).lowerBound >= 18;
```

## Complete Example (Cross-Platform)

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import {
  getAndroidPlayAgeRangeStatus,
  requestIOSDeclaredAgeRange,
} from 'react-native-store-age-declaration';

export default function App() {
  const [status, setStatus] = useState(null);

  const check = async () => {
    if (Platform.OS === 'android') {
      const result = await getAndroidPlayAgeRangeStatus();
      setStatus(result);
    } else if (Platform.OS === 'ios') {
      const result = await requestIOSDeclaredAgeRange(13, 17, 21);
      setStatus(result);
    }
  };

  useEffect(() => { check(); }, []);

  if (!status) return <Text>Loading...</Text>;
  if (status.error) return <Text>Error: {status.error}</Text>;

  return (
    <View>
      <Text>Status: {status.userStatus}</Text>
      <Button title="Refresh" onPress={check} />
    </View>
  );
}
```

## Troubleshooting

### Android

**Problem:** Always returns `UNKNOWN`  
**Solution:** User may not have Family Link. Show safe content by default.

**Problem:** `AGE_SIGNALS_INIT_ERROR`  
**Solution:** Device lacks Google Play Services. Use manual age verification.

**Problem:** Slow response  
**Solution:** Implement timeout and caching.

### iOS

**Problem:** `IOS_VERSION_ERROR`  
**Solution:** Check iOS version before calling. Requires iOS 18+.

**Problem:** User always declines  
**Solution:** Explain why age verification is needed in your UI.

**Problem:** Cannot test on simulator  
**Solution:** Use physical device with iOS 18+ for full testing.

---

For more details, see the [full documentation](./README.md).

# Quick Reference Guide

## Installation

```bash
npm install react-native-store-age-declaration
```

## Basic Usage

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

const result = await getAndroidPlayAgeRangeStatus();
```

## Response Object

```typescript
{
  installId: string | null,    // Unique installation ID
  userStatus: string | null,   // 'OVER_AGE' | 'UNDER_AGE' | 'UNKNOWN'
  error: string | null         // Error message if failed
}
```

## Common Patterns

### Check if User is Adult

```typescript
const result = await getAndroidPlayAgeRangeStatus();
const isAdult = result.userStatus === 'OVER_AGE';
```

### Filter Content by Age

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.userStatus === 'OVER_AGE') {
  showAllContent();
} else {
  showKidsContent();
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

### React Hook

```typescript
function useAgeStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAndroidPlayAgeRangeStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  return { status, loading, isAdult: status?.userStatus === 'OVER_AGE' };
}
```

## User Status Values

| Value | Meaning |
|-------|---------|
| `OVER_AGE` | User is above age threshold ✅ |
| `UNDER_AGE` | User is below age threshold 🧒 |
| `UNKNOWN` | Age cannot be determined ❓ |
| `null` | Error occurred ⚠️ |

## Error Types

| Error | Cause |
|-------|-------|
| `AGE_SIGNALS_INIT_ERROR` | Google Play Services unavailable |
| Network errors | Connection issues |

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

- ✅ Android (API 21+)
- ⏳ iOS (Coming soon)

## Links

- [Full Documentation](./README.md)
- [API Reference](./API.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Example App](./example/src/App.tsx)

## One-Liner Examples

```typescript
// Simple check
const isAdult = (await getAndroidPlayAgeRangeStatus()).userStatus === 'OVER_AGE';

// With error handling
const canShow = (await getAndroidPlayAgeRangeStatus()).error ? false : true;

// Platform check
const status = Platform.OS === 'android' ? await getAndroidPlayAgeRangeStatus() : null;
```

## Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

export default function App() {
  const [status, setStatus] = useState(null);

  const check = async () => {
    const result = await getAndroidPlayAgeRangeStatus();
    setStatus(result);
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

**Problem:** Always returns `UNKNOWN`  
**Solution:** User may not have Family Link. Show safe content by default.

**Problem:** `AGE_SIGNALS_INIT_ERROR`  
**Solution:** Device lacks Google Play Services. Use manual age verification.

**Problem:** Slow response  
**Solution:** Implement timeout and caching.

---

For more details, see the [full documentation](./README.md).

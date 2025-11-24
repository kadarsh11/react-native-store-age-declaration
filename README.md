# react-native-store-age-declaration

A unified API for implementing age-appropriate experiences across iOS and Android platforms. This library provides easy access to platform-specific age verification and parental control APIs.

## Features

- ✅ **Android Play Age Signals** - Access Google Play's Age Range Declaration API
- 🔒 **Type-safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **Promise-based** - Modern async/await API
- 🎯 **Zero dependencies** - Lightweight with no external dependencies
- 📱 **React Native** - Built on React Native's Turbo Module architecture

## Installation

```sh
npm install react-native-store-age-declaration
```

or with yarn:

```sh
yarn add react-native-store-age-declaration
```

### Platform-Specific Setup

#### Android

The library automatically includes the Google Play Age Signals dependency. No additional setup required.

**Minimum Requirements:**
- minSdkVersion: 21
- compileSdkVersion: 33+

#### iOS

iOS support coming soon.

## API Reference

### `getAndroidPlayAgeRangeStatus()`

Retrieves the age range declaration status from Google Play Age Signals API. This method checks the user's age status as determined by Google Play's parental controls and family settings.

**Platform:** Android only

**Returns:** `Promise<PlayAgeRangeStatusResult>`

#### Return Type

```typescript
interface PlayAgeRangeStatusResult {
  installId: string | null;  // Unique identifier for this app installation
  userStatus: string | null;  // Age status: 'UNDER_AGE', 'OVER_AGE', or 'UNKNOWN'
  error: string | null;       // Error message if the operation failed
}
```

#### User Status Values

| Status | Description |
|--------|-------------|
| `UNDER_AGE` | User is below the age threshold set by the app |
| `OVER_AGE` | User is at or above the age threshold |
| `UNKNOWN` | Age information is not available or could not be determined |

#### Example Usage

##### Basic Usage

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function checkUserAge() {
  const result = await getAndroidPlayAgeRangeStatus();
  
  if (result.error) {
    console.error('Error:', result.error);
    return;
  }
  
  console.log('Install ID:', result.installId);
  console.log('User Status:', result.userStatus);
}
```

##### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

function AgeGateComponent() {
  const [loading, setLoading] = useState(true);
  const [isAgeAppropriate, setIsAgeAppropriate] = useState(false);

  useEffect(() => {
    checkAge();
  }, []);

  async function checkAge() {
    try {
      const result = await getAndroidPlayAgeRangeStatus();
      
      if (!result.error && result.userStatus === 'OVER_AGE') {
        setIsAgeAppropriate(true);
      }
    } catch (error) {
      console.error('Age check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {isAgeAppropriate ? (
        <Text>Welcome! You can access all features.</Text>
      ) : (
        <Text>Some features are restricted based on age.</Text>
      )}
    </View>
  );
}
```

##### Conditional Content Rendering

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function shouldShowMatureContent(): Promise<boolean> {
  const result = await getAndroidPlayAgeRangeStatus();
  
  // Show mature content only if user is confirmed over age
  return result.userStatus === 'OVER_AGE';
}

// Usage in your app
async function loadContent() {
  const canShowMature = await shouldShowMatureContent();
  
  if (canShowMature) {
    // Load all content
    loadAllGames();
  } else {
    // Load age-appropriate content only
    loadKidFriendlyGames();
  }
}
```

## Error Handling

The library provides detailed error messages to help you debug issues:

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.error) {
  if (result.error.includes('AGE_SIGNALS_INIT_ERROR')) {
    // Google Play Services might not be available
    console.log('Age signals service unavailable');
  } else {
    // Other errors
    console.log('Error:', result.error);
  }
}
```

### Common Error Scenarios

| Error | Possible Cause | Solution |
|-------|---------------|----------|
| `AGE_SIGNALS_INIT_ERROR` | Google Play Services unavailable | Check if device has Google Play Services |
| Network errors | No internet connection | Retry when connection is restored |
| `UNKNOWN` status | User hasn't set up Family Link | Use default age-neutral content |

## Best Practices

### 1. **Graceful Fallbacks**

Always handle cases where age information is unavailable:

```typescript
const result = await getAndroidPlayAgeRangeStatus();

if (result.error || result.userStatus === 'UNKNOWN') {
  // Default to safe, age-appropriate content
  showSafeContent();
} else if (result.userStatus === 'OVER_AGE') {
  showAllContent();
} else {
  showKidsContent();
}
```

### 2. **Cache Results**

Age status rarely changes during an app session. Cache the result:

```typescript
let cachedAgeStatus: PlayAgeRangeStatusResult | null = null;

async function getAgeStatus() {
  if (!cachedAgeStatus) {
    cachedAgeStatus = await getAndroidPlayAgeRangeStatus();
  }
  return cachedAgeStatus;
}
```

### 3. **Platform-Specific Code**

Since this is Android-only currently, use platform checks:

```typescript
import { Platform } from 'react-native';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function checkAgeStatus() {
  if (Platform.OS === 'android') {
    return await getAndroidPlayAgeRangeStatus();
  } else {
    // iOS fallback or alternative implementation
    return { installId: null, userStatus: 'UNKNOWN', error: null };
  }
}
```

### 4. **Privacy Compliance**

- Only use age signals for age-appropriate content filtering
- Don't use `installId` for tracking purposes without user consent
- Follow COPPA, GDPR, and other privacy regulations
- Provide clear privacy disclosures in your app

## Understanding Google Play Age Signals

Google Play Age Signals helps developers provide age-appropriate experiences by accessing age information from:

- **Family Link accounts** - Parental controls set up by parents
- **Play Store age declarations** - User-provided age information
- **Account settings** - Google account age data

The API respects user privacy and only provides:
- Whether the user is above/below your app's age threshold
- A unique installation ID (not linked to personal information)

## Troubleshooting

### Age status always returns UNKNOWN

**Possible causes:**
1. User doesn't have Family Link set up
2. User hasn't declared age in Play Store
3. Device doesn't have Google Play Services
4. App not installed from Google Play Store

**Solution:** Implement fallback logic for `UNKNOWN` status

### Error: AGE_SIGNALS_INIT_ERROR

**Cause:** Google Play Services unavailable or outdated

**Solution:**
```typescript
// Check if device supports age signals
const result = await getAndroidPlayAgeRangeStatus();
if (result.error?.includes('INIT_ERROR')) {
  // Fall back to manual age verification
  showManualAgeGate();
}
```

## Requirements

### Android
- React Native >= 0.71
- Android API Level >= 21 (Android 5.0)
- Google Play Services installed on device
- App distributed through Google Play Store (for full functionality)

### iOS
- Coming soon

## TypeScript Support

This library is written in TypeScript and includes complete type definitions. All types are exported for your convenience:

```typescript
import type { 
  PlayAgeRangeStatusResult 
} from 'react-native-store-age-declaration';
```

## Documentation

- 📚 **[API Reference](./API.md)** - Complete API documentation with detailed method descriptions and type definitions
- 🚀 **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Step-by-step guide with real-world examples and best practices
- 🔍 **[Code Examples](./example/src/App.tsx)** - Working example app demonstrating library usage

## Links & Resources

- [Google Play Age Signals Documentation](https://developer.android.com/guide/playcore/age-signals)
- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [React Native Documentation](https://reactnative.dev/)

## Contributing

We welcome contributions! Please see:

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Support

- 🐛 [Report a Bug](https://github.com/meneetu/ccep-technical-assignment/issues)
- 💬 [Ask a Question](https://github.com/meneetu/ccep-technical-assignment/discussions)
- 📧 Contact: [Create an issue](https://github.com/meneetu/ccep-technical-assignment/issues/new)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

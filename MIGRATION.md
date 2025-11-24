# Migration & Upgrade Guide

This guide helps you migrate to `react-native-store-age-declaration` or upgrade between versions.

## Table of Contents

- [New Installation](#new-installation)
- [Migrating from Manual Age Verification](#migrating-from-manual-age-verification)
- [Migrating from Other Libraries](#migrating-from-other-libraries)
- [Version Upgrades](#version-upgrades)
- [Breaking Changes](#breaking-changes)

---

## New Installation

If this is your first time using age verification in your app:

### Step 1: Install

```bash
npm install react-native-store-age-declaration
# or
yarn add react-native-store-age-declaration
```

### Step 2: Rebuild

```bash
# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### Step 3: Implement

Follow the [Implementation Guide](./IMPLEMENTATION_GUIDE.md) for detailed setup.

---

## Migrating from Manual Age Verification

### Before (Manual Age Input)

```typescript
// Old approach
function AgeGate() {
  const [age, setAge] = useState('');
  
  const handleSubmit = () => {
    const userAge = parseInt(age);
    if (userAge >= 13) {
      setIsAgeAppropriate(true);
    }
  };
  
  return (
    <TextInput
      placeholder="Enter your age"
      value={age}
      onChangeText={setAge}
    />
  );
}
```

### After (Automated with Play Age Signals)

```typescript
// New approach
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

function AgeGate() {
  const [loading, setLoading] = useState(true);
  const [isAgeAppropriate, setIsAgeAppropriate] = useState(false);

  useEffect(() => {
    checkAge();
  }, []);

  async function checkAge() {
    const result = await getAndroidPlayAgeRangeStatus();
    
    if (result.userStatus === 'OVER_AGE') {
      setIsAgeAppropriate(true);
    } else if (result.userStatus === 'UNKNOWN') {
      // Fallback to manual input
      showManualAgeInput();
    }
    
    setLoading(false);
  }

  // No UI needed for age input in most cases!
}
```

### Migration Benefits

✅ **No user input needed** - Automatic age detection  
✅ **More accurate** - Based on Google account data  
✅ **Better UX** - No forms to fill out  
✅ **Privacy compliant** - No age data stored in your app  
✅ **Parent controlled** - Respects Family Link settings  

### Keeping Manual Fallback

```typescript
async function getAgeStatus() {
  if (Platform.OS === 'android') {
    const result = await getAndroidPlayAgeRangeStatus();
    
    if (result.error || result.userStatus === 'UNKNOWN') {
      // Fallback to your existing manual method
      return await showManualAgeInput();
    }
    
    return result.userStatus === 'OVER_AGE';
  } else {
    // iOS - use manual input until iOS support is added
    return await showManualAgeInput();
  }
}
```

---

## Migrating from Other Libraries

### From Custom Device Restrictions API

```typescript
// Before (deprecated Android API)
import { UserManager } from 'react-native';

const restrictions = await UserManager.getUserRestrictions();
const isChild = restrictions.includes('no_modify_accounts');
```

```typescript
// After
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

const result = await getAndroidPlayAgeRangeStatus();
const isChild = result.userStatus === 'UNDER_AGE';
```

### From Third-Party Age Verification Services

```typescript
// Before (third-party service)
import AgeChecker from 'some-age-service';

const verified = await AgeChecker.verify({
  birthDate: userBirthDate,
  document: idDocument
});
```

```typescript
// After (no personal data needed)
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

const result = await getAndroidPlayAgeRangeStatus();
const isAdult = result.userStatus === 'OVER_AGE';

// No need to collect or store birth dates or ID documents!
```

---

## Version Upgrades

### Upgrading from 0.1.x to 1.0.0 (Future)

When v1.0.0 is released, check this section for any breaking changes.

Currently, the library is in initial development (0.1.x).

---

## Breaking Changes

### Version 1.0.0 (When Released)

This section will document any breaking changes in the 1.0.0 release.

### Current Version (0.1.x)

No breaking changes yet as this is the initial release.

---

## Common Migration Patterns

### Pattern 1: Replace Age Input Forms

**Before:**
```typescript
function App() {
  const [userAge, setUserAge] = useState<number | null>(null);
  
  if (!userAge) {
    return <AgeInputForm onSubmit={setUserAge} />;
  }
  
  return <MainApp userAge={userAge} />;
}
```

**After:**
```typescript
function App() {
  const { isLoading, ageStatus } = useAgeGate();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return <MainApp ageStatus={ageStatus} />;
}
```

### Pattern 2: Replace Birth Date Collection

**Before:**
```typescript
// Don't do this - storing birth dates has privacy implications
const [birthDate, setBirthDate] = useState('');

AsyncStorage.setItem('userBirthDate', birthDate);
```

**After:**
```typescript
// Better - no personal data collection needed
const result = await getAndroidPlayAgeRangeStatus();
// No need to store anything, call again when needed
```

### Pattern 3: Replace Content Filtering Logic

**Before:**
```typescript
function filterContent(items: Item[], userAge: number) {
  return items.filter(item => item.minAge <= userAge);
}
```

**After:**
```typescript
async function filterContent(items: Item[]) {
  const result = await getAndroidPlayAgeRangeStatus();
  
  if (result.userStatus === 'OVER_AGE') {
    return items; // All content
  } else {
    return items.filter(item => item.isKidFriendly);
  }
}
```

### Pattern 4: Replace Age Verification State

**Before:**
```typescript
const AgeContext = createContext({
  userAge: 0,
  isVerified: false,
});
```

**After:**
```typescript
const AgeContext = createContext({
  ageStatus: 'UNKNOWN' as AgeStatus,
  isAdult: false,
  isChild: false,
});
```

---

## Data Migration

### If You Were Storing Age Data

```typescript
// Clean up old age data
async function migrateToNewSystem() {
  // Remove old age-related data
  await AsyncStorage.removeItem('userAge');
  await AsyncStorage.removeItem('userBirthDate');
  await AsyncStorage.removeItem('ageVerified');
  
  // Initialize new system
  const result = await getAndroidPlayAgeRangeStatus();
  
  // Optionally cache the result
  await AsyncStorage.setItem('lastAgeCheck', JSON.stringify({
    status: result.userStatus,
    timestamp: Date.now(),
  }));
}
```

**Note:** Don't permanently store the age status. The library handles caching internally. Only store if you need persistence across app restarts.

---

## Testing Migration

### Before Production

1. **Test with different age groups**
   - Test with Family Link child account
   - Test with adult account
   - Test with no Google account

2. **Test error scenarios**
   - Test with no internet
   - Test on device without Google Play Services
   - Test fallback to manual input

3. **Test content filtering**
   - Verify child accounts see appropriate content
   - Verify adult accounts see all content
   - Verify unknown status shows safe content

4. **Performance testing**
   - First call timing
   - Cached call timing
   - Memory usage

### Migration Checklist

- [ ] Remove old age verification code
- [ ] Install new library
- [ ] Update dependencies
- [ ] Implement new API calls
- [ ] Add error handling
- [ ] Add fallback for UNKNOWN status
- [ ] Update UI components
- [ ] Remove age data collection forms
- [ ] Clean up stored age data
- [ ] Update privacy policy
- [ ] Test on multiple devices
- [ ] Test with different account types
- [ ] Test offline behavior
- [ ] Deploy to beta testers
- [ ] Monitor error rates
- [ ] Update documentation

---

## Rollback Plan

If you need to rollback:

### Step 1: Keep Old Code

Don't delete your old age verification code immediately. Keep it for 1-2 releases.

```typescript
// feature-flag.ts
export const USE_NEW_AGE_VERIFICATION = true;

// age-service.ts
async function getAgeStatus() {
  if (USE_NEW_AGE_VERIFICATION) {
    return await newAgeVerification();
  } else {
    return await oldAgeVerification();
  }
}
```

### Step 2: Monitor Metrics

Track:
- Error rates
- Unknown status rates
- User complaints
- Content filtering accuracy

### Step 3: Gradual Rollout

```typescript
// Rollout to percentage of users
const USE_NEW_AGE_VERIFICATION = Math.random() < 0.5; // 50% rollout
```

---

## Platform-Specific Migration

### Android

**Minimum SDK Update:**
```gradle
// If your minSdkVersion is below 21, update it
android {
  defaultConfig {
    minSdkVersion 21  // Required
  }
}
```

**ProGuard Rules:**
If you use ProGuard, no special rules needed. The library handles it.

### iOS (When Available)

iOS migration guide will be added when iOS support is released.

---

## Common Migration Issues

### Issue 1: Always Returns UNKNOWN

**Cause:** Users don't have Family Link or haven't set age in Play Store.

**Solution:** Implement fallback to manual input for UNKNOWN status.

```typescript
if (result.userStatus === 'UNKNOWN') {
  const manualAge = await showAgeInputDialog();
  return manualAge >= 13;
}
```

### Issue 2: Users Confused by Automatic Age Detection

**Solution:** Add explanation in your UI.

```typescript
<Text>
  We use your Google account settings to provide age-appropriate content.
  Your age information is private and never shared.
</Text>
```

### Issue 3: Testing Difficult Without Family Link

**Solution:** Create test accounts or use feature flags.

```typescript
// For testing
if (__DEV__) {
  return { userStatus: 'UNDER_AGE', installId: 'test', error: null };
}
```

---

## Support During Migration

- 📖 [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- 📚 [API Documentation](./API.md)
- 🐛 [Report Issues](https://github.com/meneetu/ccep-technical-assignment/issues)
- 💬 [Ask Questions](https://github.com/meneetu/ccep-technical-assignment/discussions)

---

## Next Steps

After migration:

1. **Update Documentation** - Update your app's documentation
2. **Update Privacy Policy** - Mention use of Google Play Age Signals
3. **Monitor Analytics** - Track age status distribution
4. **Gather Feedback** - Listen to user feedback
5. **Optimize** - Fine-tune content filtering based on data

---

**Good luck with your migration! 🚀**

If you run into issues, please [open an issue](https://github.com/meneetu/ccep-technical-assignment/issues) and we'll help you out.

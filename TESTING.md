# Testing Guide

## Testing on Android

### Requirements
- **Physical Android device** with Google Play Services installed, OR
- **Android emulator** with Google Play (look for devices with the Play Store icon)
  - AVD with "Play Store" system image (e.g., Pixel 5 API 33 with Google Play)
  - **NOT** regular AOSP emulators without Google Play

### Steps

1. **Build the library:**
   ```bash
   cd /Users/adarshkumar/Desktop/library/react-native-store-age-declaration
   yarn install
   yarn prepare
   ```

2. **Install example app:**
   ```bash
   cd example
   yarn install
   ```

3. **Run on Android:**
   ```bash
   # Start Metro bundler
   yarn start
   
   # In another terminal:
   yarn android
   # OR
   npx react-native run-android
   ```

4. **Test the feature:**
   - Tap "Check Android Age Status" button
   - Should see age range status from Google Play

### Expected Results

**On device WITH Google Play Services:**
```javascript
{
  installId: "uuid-string",
  userStatus: "OVER_AGE" | "UNDER_AGE" | "UNKNOWN",
  error: null
}
```

**On device WITHOUT Google Play Services:**
```javascript
{
  installId: null,
  userStatus: null,
  error: "AGE_SIGNALS_INIT_ERROR: ..."
}
```

### Troubleshooting

**"Not yet implemented" or "AGE_SIGNALS_INIT_ERROR":**
- ✅ Check if Google Play Services is installed on your device/emulator
- ✅ Use an emulator with Google Play Store (not AOSP)
- ✅ Ensure Google Play Services is up to date

**To verify Google Play Services:**
```bash
# Check if Google Play Services is installed
adb shell "pm list packages | grep google"

# Should include:
# com.google.android.gms (Google Play Services)
# com.android.vending (Play Store)
```

## Testing on iOS

### Requirements
- **iOS 18.0+** device or simulator
- **Xcode 16+** (for iOS 18 SDK)
- **App Store entitlements** (for production)

### Current Status
⚠️ **iOS implementation is a placeholder** because:
- Apple's Declared Age Range API requires iOS 18 SDK
- Requires specific App Store entitlements
- Framework not yet fully available in public SDK

### Steps

1. **Install pods:**
   ```bash
   cd example/ios
   pod install
   ```

2. **Run on iOS:**
   ```bash
   cd ..
   yarn ios
   # OR
   npx react-native run-ios
   ```

3. **Test the feature:**
   - Tap "Request iOS Age Declaration" button
   - Currently returns placeholder: `status: "declined"`

### Expected Results (Current Placeholder)

```javascript
{
  status: "declined",
  parentControls: null,
  lowerBound: null,
  upperBound: null
}
```

### Future Implementation

When iOS 18 SDK and entitlements are available, the iOS implementation needs:

1. **Update Podspec** to include DeclaredAgeRange framework:
   ```ruby
   s.framework = ['UIKit', 'DeclaredAgeRange']
   ```

2. **Update Swift code** in `ios/StoreAgeDeclaration.swift`:
   ```swift
   import DeclaredAgeRange
   
   // Replace placeholder with actual API call
   DeclaredAgeRange.requestAgeRange(
     thresholds: [firstThresholdAge, secondThresholdAge, thirdThresholdAge]
   ) { result in
     // Handle result
   }
   ```

3. **Add entitlements** in Xcode project

## Quick Test Script

Run this to test everything at once:

```bash
#!/bin/bash

echo "🧪 Testing react-native-store-age-declaration"

# Build library
echo "📦 Building library..."
cd /Users/adarshkumar/Desktop/library/react-native-store-age-declaration
yarn install
yarn prepare

# Build example
echo "📱 Setting up example app..."
cd example
yarn install

# Check platform
echo "📋 Select platform to test:"
echo "1) Android"
echo "2) iOS"
read -p "Enter choice (1 or 2): " platform

if [ "$platform" = "1" ]; then
  echo "🤖 Testing on Android..."
  echo "⚠️  Make sure you're using a device/emulator with Google Play Services"
  yarn android
elif [ "$platform" = "2" ]; then
  echo "🍎 Testing on iOS..."
  echo "⚠️  Note: iOS implementation is currently a placeholder"
  cd ios
  pod install
  cd ..
  yarn ios
else
  echo "❌ Invalid choice"
fi
```

Save this as `test.sh` and run: `chmod +x test.sh && ./test.sh`

## Verifying the Build

Check if native modules are properly linked:

**Android:**
```bash
cd example/android
./gradlew :app:dependencies | grep agesignals
# Should show: com.google.android.play:agesignals:1.0.0
```

**iOS:**
```bash
cd example/ios
pod list | grep StoreAgeDeclaration
# Should show: StoreAgeDeclaration (from `../../`)
```

## Common Issues

### Android

**Issue:** "AGE_SIGNALS_INIT_ERROR"
- **Cause:** Google Play Services not available
- **Fix:** Use device/emulator with Google Play

**Issue:** Module not found
- **Cause:** Build not completed
- **Fix:** Run `yarn prepare` in root directory

**Issue:** Gradle build fails
- **Cause:** Missing dependency
- **Fix:** Check `android/build.gradle` has `agesignals` dependency

### iOS

**Issue:** Pod install fails
- **Cause:** CocoaPods cache
- **Fix:** `cd example/ios && pod deintegrate && pod install`

**Issue:** Module not found
- **Cause:** Build not completed
- **Fix:** Run `yarn prepare` in root directory

**Issue:** Always returns "declined"
- **Cause:** Placeholder implementation
- **Fix:** This is expected until iOS 18 SDK integration

## Production Checklist

Before publishing your app:

### Android
- ✅ Test on physical device with Google account
- ✅ Test with Family Link managed account (if targeting kids)
- ✅ Verify age gate UI/UX
- ✅ Test offline scenario
- ✅ Add proper error handling

### iOS
- ⏳ Wait for iOS 18 SDK availability
- ⏳ Request App Store entitlements
- ⏳ Replace placeholder implementation
- ⏳ Test on iOS 18+ devices
- ⏳ Submit for App Store review

## Support

For issues:
- 📄 Check [README.md](./README.md)
- 📖 Read [API.md](./API.md)
- 🐛 Open issue on [GitHub](https://github.com/kadarsh11/react-native-store-age-declaration/issues)

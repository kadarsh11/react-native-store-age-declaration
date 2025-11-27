
import { TextInput } from 'react-native';
import StoreAgeDeclaration from './NativeStoreAgeDeclaration';
import type {
  PlayAgeRangeStatusResult,
  DeclaredAgeRangeResult,
} from './NativeStoreAgeDeclaration';
export * from './useStoreAgeDeclaration';

/**
 * Example multiplication function
 * @param a First number
 * @param b Second number
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
  return StoreAgeDeclaration.multiply(a, b);
}

/**
 * Retrieves comprehensive age signals from Google Play Age Signals API (Beta).
 * 
 * This function queries Google Play Services to get detailed age verification information.
 * The API returns different data based on user type:
 * 
 * **VERIFIED Users (18+):**
 * - Age verified by government ID, credit card, or facial age estimation
 * - Only userStatus is set to 'VERIFIED'
 * 
 * **SUPERVISED Users (Family Link):**
 * - Managed Google Account with parental controls
 * - Returns: userStatus, ageLower, ageUpper, installId, mostRecentApprovalDate
 * - Default age ranges: 0-12, 13-15, 16-17, 18+
 * 
 * **UNKNOWN Users:**
 * - Not verified or supervised (could be over or under 18)
 * - User should visit Play Store to resolve status
 * 
 * @platform Android - Requires Google Play Services
 * @platform iOS - Not available, use requestIOSDeclaredAgeRange()
 * 
 * @returns Promise that resolves with complete age signals data:
 *   - installId: Install UUID (supervised users only)
 *   - userStatus: 'VERIFIED' | 'SUPERVISED' | 'SUPERVISED_APPROVAL_PENDING' | 
 *                 'SUPERVISED_APPROVAL_DENIED' | 'UNKNOWN' | ''
 *   - ageLower: Lower age bound (supervised users only)
 *   - ageUpper: Upper age bound (supervised users only)
 *   - mostRecentApprovalDate: Date of last approved change (supervised users only)
 *   - error: Error message if failed
 *   - errorCode: Numeric error code if failed
 * 
 * @example Handle verified adult user
 * ```typescript
 * const result = await getAndroidPlayAgeRangeStatus();
 * 
 * if (result.userStatus === 'VERIFIED') {
 *   console.log('User is verified 18+');
 *   showAdultContent();
 * }
 * ```
 * 
 * @example Handle supervised user with age range
 * ```typescript
 * const result = await getAndroidPlayAgeRangeStatus();
 * 
 * if (result.userStatus === 'SUPERVISED' && result.ageLower && result.ageUpper) {
 *   console.log(`Child aged ${result.ageLower}-${result.ageUpper}`);
 *   
 *   if (result.ageUpper < 13) {
 *     showKidsContent();
 *   } else if (result.ageUpper < 18) {
 *     showTeenContent();
 *   } else {
 *     showAdultContent();
 *   }
 * }
 * ```
 * 
 * @example Handle approval states
 * ```typescript
 * const result = await getAndroidPlayAgeRangeStatus();
 * 
 * switch (result.userStatus) {
 *   case 'SUPERVISED_APPROVAL_PENDING':
 *     showMessage('Waiting for parent approval');
 *     break;
 *   case 'SUPERVISED_APPROVAL_DENIED':
 *     showMessage('Parent denied access');
 *     disableFeature();
 *     break;
 * }
 * ```
 * 
 * @example Handle errors with retry
 * ```typescript
 * const result = await getAndroidPlayAgeRangeStatus();
 * 
 * if (result.error) {
 *   switch (result.errorCode) {
 *     case -1: // API_NOT_AVAILABLE
 *     case -6: // PLAY_STORE_VERSION_OUTDATED
 *       showMessage('Please update Play Store');
 *       break;
 *     case -3: // NETWORK_ERROR
 *       showMessage('Check your connection');
 *       retryLater();
 *       break;
 *     case -9: // APP_NOT_OWNED
 *       showMessage('Install app from Play Store');
 *       break;
 *     default:
 *       console.error(result.error);
 *   }
 * }
 * ```
 * 
 * @example With React hooks
 * ```typescript
 * import { useEffect, useState } from 'react';
 * import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';
 * 
 * function MyComponent() {
 *   const [isAdult, setIsAdult] = useState(false);
 *   
 *   useEffect(() => {
 *     getAndroidPlayAgeRangeStatus().then(result => {
 *       setIsAdult(result.userStatus === 'OVER_AGE');
 *     });
 *   }, []);
 *   
 *   return isAdult ? <AdultContent /> : <KidsContent />;
 * }
 * ```
 * 
 * @example Error handling
 * ```typescript
 * const result = await getAndroidPlayAgeRangeStatus();
 * 
 * if (result.error) {
 *   if (result.error.includes('AGE_SIGNALS_INIT_ERROR')) {
 *     // Google Play Services not available
 *     showManualAgeVerification();
 *   } else {
 *     // Other error
 *     showErrorMessage(result.error);
 *   }
 * }
 * ```
 * 
 * @see {@link https://developer.android.com/guide/playcore/age-signals Google Play Age Signals Documentation}
 */
export function getAndroidPlayAgeRangeStatus(): Promise<PlayAgeRangeStatusResult> {
  return StoreAgeDeclaration.getAndroidPlayAgeRangeStatus();
}

/**
 * Requests age range declaration from iOS Declared Age Range API.
 * 
 * Uses AgeRangeService to request a person's declared age range with automatic
 * system UI presentation. For children in Family Sharing groups, parents/guardians
 * control whether age information is shared.
 * 
 * ⚠️ **IMPORTANT REQUIREMENTS:**
 * - iOS 26.0+, iPadOS 26.0+, macOS 26.0+, or Mac Catalyst 26.0+
 * - Xcode 17+ with iOS 26 SDK
 * - Entitlement: com.apple.developer.declared-age-range = true
 * - Age data is based on user/parent declarations - ensure compliance with your regulations
 * 
 * @platform iOS 26.0+ - Requires iOS 26 or later
 * @platform Android - Not available on Android, use getAndroidPlayAgeRangeStatus()
 * 
 * @param firstThresholdAge First age threshold (e.g., 13)
 * @param secondThresholdAge Second age threshold (e.g., 17)
 * @param thirdThresholdAge Third age threshold (e.g., 21)
 * 
 * @returns Promise that resolves with an object containing:
 *   - status: 'sharing' | 'declined'
 *   - declaration: 'user_declared' | 'parent_guardian_declared' | 'organizer_declared' | null
 *   - parentControls: 'restricted' | null (set if parent/organizer declared)
 *   - lowerBound: Lower bound of age range (if status is 'sharing')
 *   - upperBound: Upper bound of age range (if status is 'sharing')
 * 
 * @throws {IOS_VERSION_ERROR} If iOS version is below 26.0
 * @throws {SDK_NOT_AVAILABLE} If built without iOS 26 SDK
 * @throws {AGE_RANGE_ERROR} If request fails or user cancels
 * 
 * @see https://developer.apple.com/documentation/declaredagerange
 * 
 * @example Basic usage with declaration type
 * ```typescript
 * import { requestIOSDeclaredAgeRange } from 'react-native-store-age-declaration';
 * 
 * async function checkIOSAge() {
 *   try {
 *     // Define age thresholds: 13, 17, 21
 *     const result = await requestIOSDeclaredAgeRange(13, 17, 21);
 *     
 *     if (result.status === 'sharing') {
 *       console.log('Age range:', result.lowerBound, '-', result.upperBound);
 *       console.log('Declared by:', result.declaration);
 *       console.log('Parental controls:', result.parentControls);
 *       
 *       // Handle different declaration types
 *       if (result.declaration === 'parent_guardian_declared') {
 *         console.log('Age declared by parent/guardian');
 *       } else if (result.declaration === 'user_declared') {
 *         console.log('Age declared by user');
 *       }
 *       
 *       // Filter content by age
 *       if (result.lowerBound && result.lowerBound >= 17) {
 *         showMatureContent();
 *       } else {
 *         showAgeAppropriateContent();
 *       }
 *     } else if (result.status === 'declined') {
 *       console.log('User/parent declined to share age');
 *       showDefaultContent();
 *     }
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * }
 * ```
 * 
 * @example With React hooks
 * ```typescript
 * import { useState, useEffect } from 'react';
 * import { Platform } from 'react-native';
 * import { requestIOSDeclaredAgeRange } from 'react-native-store-age-declaration';
 * 
 * function MyComponent() {
 *   const [ageRange, setAgeRange] = useState(null);
 *   
 *   useEffect(() => {
 *     if (Platform.OS === 'ios') {
 *       requestIOSDeclaredAgeRange(13, 17, 21)
 *         .then(setAgeRange)
 *         .catch(console.error);
 *     }
 *   }, []);
 *   
 *   if (!ageRange) return <LoadingView />;
 *   
 *   return ageRange.status === 'sharing' ? 
 *     <ContentView ageRange={ageRange} /> : 
 *     <DefaultView />;
 * }
 * ```
 * 
 * @example Platform-specific usage
 * ```typescript
 * import { Platform } from 'react-native';
 * import { 
 *   requestIOSDeclaredAgeRange,
 *   getAndroidPlayAgeRangeStatus 
 * } from 'react-native-store-age-declaration';
 * 
 * async function checkAgeAcrossPlatforms() {
 *   if (Platform.OS === 'ios') {
 *     const result = await requestIOSDeclaredAgeRange(13, 17, 21);
 *     return result.status === 'sharing' && result.lowerBound >= 18;
 *   } else if (Platform.OS === 'android') {
 *     const result = await getAndroidPlayAgeRangeStatus();
 *     return result.userStatus === 'OVER_AGE';
 *   }
 *   return false;
 * }
 * ```
 * 
 * @see {@link https://developer.apple.com/documentation/declaredagerange Apple's Declared Age Range Documentation}
 */
export function requestIOSDeclaredAgeRange(
  firstThresholdAge: number,
  secondThresholdAge: number,
  thirdThresholdAge: number
): Promise<DeclaredAgeRangeResult> {
  return StoreAgeDeclaration.requestIOSDeclaredAgeRange(
    firstThresholdAge,
    secondThresholdAge,
    thirdThresholdAge
  );
}

/**
 * Result object returned by getAndroidPlayAgeRangeStatus()
 * @see {@link getAndroidPlayAgeRangeStatus}
 */
export type { PlayAgeRangeStatusResult, DeclaredAgeRangeResult };

/**
 * Export constants and helper utilities
 */
export {
  AgeSignalsErrorCode,
  AgeSignalsUserStatus,
  IOSAgeRangeStatus,
  DefaultAgeRanges,
  shouldRetryError,
  getErrorMessage,
  isSupervisedUser,
  isVerifiedAdult,
  isUnknownAge,
  meetsMinimumAge,
  getAgeCategory,
  needsParentalApproval,
} from './constants';

export type {
  AgeSignalsErrorCodeType,
  AgeSignalsUserStatusType,
  IOSAgeRangeStatusType,
} from './constants';

// Export unified cross-platform hook
export {
  useAgeRange,
  isUserAdult,
  isSupervised,
  getAgeRangeString,
} from './useAgeRange';

export type {
  UnifiedAgeRangeResult,
  UseAgeRangeOptions,
} from './useAgeRange';

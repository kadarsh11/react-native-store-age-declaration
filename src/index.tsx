import StoreAgeDeclaration from './NativeStoreAgeDeclaration';
import type {
  PlayAgeRangeStatusResult,
  DeclaredAgeRangeResult,
} from './NativeStoreAgeDeclaration';

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
 * Retrieves the age range declaration status from Google Play's Age Signals API.
 * 
 * This function queries Google Play Services to determine if the user is above or below
 * the age threshold configured for your application. It uses information from:
 * - Family Link accounts (parent-managed devices)
 * - Google account age data
 * - Play Store age declarations
 * 
 * @platform Android - Returns results on Android devices with Google Play Services
 * @platform iOS - Not yet implemented, will be added in a future version
 * 
 * @returns Promise that resolves with an object containing:
 *   - installId: Unique identifier for this installation (not linked to user identity)
 *   - userStatus: 'OVER_AGE' | 'UNDER_AGE' | 'UNKNOWN' | null
 *   - error: Error message if the operation failed, null otherwise
 * 
 * @example Basic usage
 * ```typescript
 * import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';
 * 
 * async function checkUserAge() {
 *   const result = await getAndroidPlayAgeRangeStatus();
 *   
 *   if (result.error) {
 *     console.error('Failed to check age:', result.error);
 *     return;
 *   }
 *   
 *   switch (result.userStatus) {
 *     case 'OVER_AGE':
 *       console.log('User is above age threshold');
 *       showAllContent();
 *       break;
 *     case 'UNDER_AGE':
 *       console.log('User is below age threshold');
 *       showKidsContent();
 *       break;
 *     case 'UNKNOWN':
 *       console.log('Age status unknown, showing safe content');
 *       showGeneralContent();
 *       break;
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
 * This function prompts the user to share their age range information using
 * iOS 18+'s Declared Age Range API. The user will see a system dialog asking
 * if they want to share their age range with your app.
 * 
 * @platform iOS 18+ - Requires iOS 18 or later
 * @platform Android - Not available on Android, use getAndroidPlayAgeRangeStatus()
 * 
 * @param firstThresholdAge First age threshold (e.g., 13)
 * @param secondThresholdAge Second age threshold (e.g., 17)
 * @param thirdThresholdAge Third age threshold (e.g., 21)
 * 
 * @returns Promise that resolves with an object containing:
 *   - status: 'sharing' | 'declined' | specific age range
 *   - parentControls: Active parental control status
 *   - lowerBound: Lower bound of age range (if shared)
 *   - upperBound: Upper bound of age range (if shared)
 * 
 * @throws Error if iOS version is below 18.0
 * @throws Error if unable to present UI
 * 
 * @example Basic usage
 * ```typescript
 * import { requestIOSDeclaredAgeRange } from 'react-native-store-age-declaration';
 * 
 * async function checkIOSAge() {
 *   try {
 *     // Define age thresholds: 13, 17, 21
 *     const result = await requestIOSDeclaredAgeRange(13, 17, 21);
 *     
 *     if (result.status === 'sharing') {
 *       console.log('User is sharing age information');
 *       console.log('Age range:', result.lowerBound, '-', result.upperBound);
 *       console.log('Parental controls:', result.parentControls);
 *       
 *       // Check if user is over 17
 *       if (result.lowerBound && result.lowerBound >= 17) {
 *         showMatureContent();
 *       } else {
 *         showAgeAppropriateContent();
 *       }
 *     } else if (result.status === 'declined') {
 *       console.log('User declined to share age');
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

import StoreAgeDeclaration from './NativeStoreAgeDeclaration';
import type { PlayAgeRangeStatusResult } from './NativeStoreAgeDeclaration';

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
 * Result object returned by getAndroidPlayAgeRangeStatus()
 * @see {@link getAndroidPlayAgeRangeStatus}
 */
export type { PlayAgeRangeStatusResult };

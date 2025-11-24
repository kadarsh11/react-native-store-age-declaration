import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Result object returned by getAndroidPlayAgeRangeStatus()
 * Contains age verification information from Google Play Age Signals API
 */
export interface PlayAgeRangeStatusResult {
  /**
   * Unique identifier for this app installation.
   * Not linked to user identity or Google account.
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  installId: string | null;

  /**
   * Age status of the user relative to your app's age threshold.
   * - 'OVER_AGE': User is at or above the age threshold
   * - 'UNDER_AGE': User is below the age threshold
   * - 'UNKNOWN': Age status cannot be determined
   * - null: An error occurred (check error property)
   */
  userStatus: string | null;

  /**
   * Error message if the operation failed.
   * null if the operation succeeded.
   * Common errors include:
   * - 'AGE_SIGNALS_INIT_ERROR': Failed to initialize Age Signals API
   * - Network errors: Connection or timeout issues
   */
  error: string | null;
}

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;

  /**
   * Retrieves the age range declaration status from Google Play's Age Signals API.
   * 
   * This method checks if the user is above or below the age threshold configured
   * for your application using information from Family Link, Google account age,
   * and Play Store declarations.
   * 
   * @platform Android
   * @returns Promise that resolves with age status information
   * 
   * @example
   * ```typescript
   * const result = await getAndroidPlayAgeRangeStatus();
   * 
   * if (result.error) {
   *   console.error('Error:', result.error);
   * } else if (result.userStatus === 'OVER_AGE') {
   *   showAllContent();
   * } else {
   *   showAgeAppropriateContent();
   * }
   * ```
   */
  getAndroidPlayAgeRangeStatus(): Promise<PlayAgeRangeStatusResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('StoreAgeDeclaration');

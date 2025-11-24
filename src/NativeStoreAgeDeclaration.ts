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

/**
 * Result object returned by requestIOSDeclaredAgeRange()
 * Contains age range declaration from iOS Declared Age Range API
 */
export interface DeclaredAgeRangeResult {
  /**
   * Status of the age range request.
   * - 'sharing': User agreed to share age information
   * - 'declined': User declined to share age information
   * - Specific age range strings for defined ranges
   */
  status: string | null;

  /**
   * Active parental controls status.
   * String representation of parental control state.
   */
  parentControls: string | null;

  /**
   * Lower bound of the declared age range.
   * null if not available or user declined.
   */
  lowerBound: number | null;

  /**
   * Upper bound of the declared age range.
   * null if not available or user declined.
   */
  upperBound: number | null;
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

  /**
   * Requests age range declaration from iOS Declared Age Range API.
   * 
   * This method prompts the user (if necessary) to share their age range information
   * using iOS 18+'s Declared Age Range API. The user can choose to share or decline.
   * 
   * @platform iOS 18+
   * @param firstThresholdAge First age threshold (e.g., 13)
   * @param secondThresholdAge Second age threshold (e.g., 17)
   * @param thirdThresholdAge Third age threshold (e.g., 21)
   * @returns Promise that resolves with declared age range information
   * 
   * @example
   * ```typescript
   * const result = await requestIOSDeclaredAgeRange(13, 17, 21);
   * 
   * if (result.status === 'sharing') {
   *   console.log('Age range:', result.lowerBound, '-', result.upperBound);
   *   console.log('Parental controls:', result.parentControls);
   * } else if (result.status === 'declined') {
   *   console.log('User declined to share age');
   * }
   * ```
   */
  requestIOSDeclaredAgeRange(
    firstThresholdAge: number,
    secondThresholdAge: number,
    thirdThresholdAge: number
  ): Promise<DeclaredAgeRangeResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('StoreAgeDeclaration');

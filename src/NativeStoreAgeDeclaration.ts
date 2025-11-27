import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Result object returned by getAndroidPlayAgeRangeStatus()
 * Contains age verification information from Google Play Age Signals API (Beta)
 * 
 * @see https://developer.android.com/google/play/age-signals/use-age-signals-api
 */
export interface PlayAgeRangeStatusResult {
  /**
   * Unique identifier for this app installation (supervised users only).
   * Not linked to user identity or Google account.
   * Used for notification purposes when app approval is revoked.
   * @example "550e8400-e29b-41d4-a716-446655441111"
   */
  installId: string | null;

  /**
   * Age verification status of the user.
   * 
   * Possible values:
   * - 'VERIFIED': User is over 18 (verified by government ID, credit card, or facial age estimation)
   * - 'SUPERVISED': User has a supervised Google Account (Family Link)
   * - 'SUPERVISED_APPROVAL_PENDING': Supervised user with pending parent approval for significant changes
   * - 'SUPERVISED_APPROVAL_DENIED': Supervised user whose parent denied approval for significant changes
   * - 'UNKNOWN': User is not verified or supervised (could be over or under 18)
   * - '': Empty string for all other users
   * - null: An error occurred (check error property)
   * 
   * @see https://developer.android.com/google/play/age-signals/use-age-signals-api#age-signals-responses
   */
  userStatus: string | null;

  /**
   * Lower bound of supervised user's age range (inclusive).
   * Only available for SUPERVISED users.
   * Range: 0-18
   * @example 13 (for age range 13-15)
   */
  ageLower: number | null;

  /**
   * Upper bound of supervised user's age range (inclusive).
   * Only available for SUPERVISED users.
   * Range: 2-18, or null if user is over 18
   * @example 15 (for age range 13-15)
   */
  ageUpper: number | null;

  /**
   * Date of the most recent approved significant change.
   * Only available for SUPERVISED users who have had significant changes approved.
   * Format: ISO 8601 date string (YYYY-MM-DD)
   * @example "2026-01-01"
   */
  mostRecentApprovalDate: string | null;

  /**
   * Error message if the operation failed.
   * null if the operation succeeded.
   * 
   * Common error codes:
   * - 'API_NOT_AVAILABLE': Play Age Signals API not available (update Play Store)
   * - 'PLAY_STORE_NOT_FOUND': Play Store not installed
   * - 'NETWORK_ERROR': No network connection
   * - 'PLAY_SERVICES_NOT_FOUND': Play Services not available
   * - 'PLAY_STORE_VERSION_OUTDATED': Play Store needs update
   * - 'PLAY_SERVICES_VERSION_OUTDATED': Play Services needs update
   * - 'APP_NOT_OWNED': App not installed via Google Play
   * - 'INTERNAL_ERROR': Unknown internal error
   * 
   * @see https://developer.android.com/google/play/age-signals/use-age-signals-api#handle-api-error-codes
   */
  error: string | null;

  /**
   * Error code number if available.
   * Corresponds to Age Signals API error codes (-1 to -100)
   */
  errorCode: number | null;
}

/**
 * Result object returned by requestIOSDeclaredAgeRange()
 * Contains age range declaration from iOS Declared Age Range API (iOS 26.0+)
 * 
 * @see https://developer.apple.com/documentation/declaredagerange
 * 
 * Requirements:
 * - iOS 26.0+, iPadOS 26.0+, macOS 26.0+, or Mac Catalyst 26.0+
 * - Entitlement: com.apple.developer.declared-age-range = true
 * 
 * Important: Age data is based on information declared by end users or their parent/guardian.
 */
export interface DeclaredAgeRangeResult {
  /**
   * Status of the age range request.
   * 
   * Possible values:
   * - 'sharing': User/parent agreed to share age information
   * - 'declined': User/parent declined to share age information
   * 
   * @example 'sharing'
   */
  status: string | null;

  /**
   * Active parental controls status.
   * 
   * Possible values:
   * - 'restricted': Age range was declared by parent/guardian or family organizer
   * - null: Age range was declared by user themselves or not sharing
   * 
   * @example 'restricted'
   */
  parentControls: string | null;

  /**
   * Lower bound of the declared age range (inclusive).
   * Only available when status is 'sharing'.
   * 
   * @example 13 (for age range 13-17)
   */
  lowerBound: number | null;

  /**
   * Upper bound of the declared age range (inclusive).
   * Only available when status is 'sharing'.
   * 
   * @example 17 (for age range 13-17)
   */
  upperBound: number | null;

  /**
   * Type of declaration indicating who provided the age information.
   * Only available when status is 'sharing'.
   * 
   * Possible values:
   * - 'user_declared': User declared their own age
   * - 'parent_guardian_declared': Parent or guardian declared child's age
   * - 'organizer_declared': Family organizer declared the age
   * - 'unknown': Declaration type could not be determined
   * - null: Not sharing or information unavailable
   * 
   * @example 'user_declared'
   */
  declaration: string | null;
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
   * Uses AgeRangeService to request a person's declared age range with system UI.
   * For children in Family Sharing, parents/guardians control sharing preferences.
   * 
   * @platform iOS 26.0+
   * @param firstThresholdAge First age threshold (e.g., 13)
   * @param secondThresholdAge Second age threshold (e.g., 17)
   * @param thirdThresholdAge Third age threshold (e.g., 21)
   * @returns Promise that resolves with declared age range information
   * 
   * @see https://developer.apple.com/documentation/declaredagerange
   * 
   * Requirements:
   * - iOS 26.0+, iPadOS 26.0+, macOS 26.0+, or Mac Catalyst 26.0+
   * - Entitlement: com.apple.developer.declared-age-range = true
   * 
   * @example
   * ```typescript
   * const result = await requestIOSDeclaredAgeRange(13, 17, 21);
   * 
   * if (result.status === 'sharing') {
   *   console.log('Age range:', result.lowerBound, '-', result.upperBound);
   *   console.log('Declaration type:', result.declaration);
   *   console.log('Parental controls:', result.parentControls);
   * } else if (result.status === 'declined') {
   *   console.log('User/parent declined to share age');
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

/**
 * Constants and enums for Store Age Declaration
 * @module constants
 */

/**
 * Age Signals API error codes
 * @see https://developer.android.com/google/play/age-signals/use-age-signals-api#handle-api-error-codes
 */
export const AgeSignalsErrorCode = {
  /** The Play Age Signals API is not available. Play Store app version might be old. */
  API_NOT_AVAILABLE: -1,
  
  /** No Play Store app is found on the device. */
  PLAY_STORE_NOT_FOUND: -2,
  
  /** No available network is found. */
  NETWORK_ERROR: -3,
  
  /** Play Services is not available or its version is too old. */
  PLAY_SERVICES_NOT_FOUND: -4,
  
  /** Binding to the service in the Play Store has failed. */
  CANNOT_BIND_TO_SERVICE: -5,
  
  /** The Play Store app needs to be updated. */
  PLAY_STORE_VERSION_OUTDATED: -6,
  
  /** Play Services needs to be updated. */
  PLAY_SERVICES_VERSION_OUTDATED: -7,
  
  /** There was a transient error in the client device. */
  CLIENT_TRANSIENT_ERROR: -8,
  
  /** The app was not installed by Google Play. */
  APP_NOT_OWNED: -9,
  
  /** Unknown internal error. */
  INTERNAL_ERROR: -100,
} as const;

export type AgeSignalsErrorCodeType =
  (typeof AgeSignalsErrorCode)[keyof typeof AgeSignalsErrorCode];

/**
 * User verification status values returned by Age Signals API
 * @see https://developer.android.com/google/play/age-signals/use-age-signals-api#age-signals-responses
 */
export const AgeSignalsUserStatus = {
  /** User is over 18, verified by government ID, credit card, or facial age estimation */
  VERIFIED: 'VERIFIED',
  
  /** User has a supervised Google Account managed by a parent */
  SUPERVISED: 'SUPERVISED',
  
  /** Supervised user with pending parent approval for significant changes */
  SUPERVISED_APPROVAL_PENDING: 'SUPERVISED_APPROVAL_PENDING',
  
  /** Supervised user whose parent denied approval for significant changes */
  SUPERVISED_APPROVAL_DENIED: 'SUPERVISED_APPROVAL_DENIED',
  
  /** User is not verified or supervised (could be over or under 18) */
  UNKNOWN: 'UNKNOWN',
  
  /** Empty string for all other users */
  EMPTY: '',
} as const;

export type AgeSignalsUserStatusType =
  (typeof AgeSignalsUserStatus)[keyof typeof AgeSignalsUserStatus];

/**
 * iOS Declared Age Range status values
 */
export const IOSAgeRangeStatus = {
  /** User agreed to share age information */
  SHARING: 'sharing',
  
  /** User declined to share age information */
  DECLINED: 'declined',
} as const;

export type IOSAgeRangeStatusType =
  (typeof IOSAgeRangeStatus)[keyof typeof IOSAgeRangeStatus];

/**
 * Default age ranges returned by Age Signals API
 * These may change based on regional requirements
 */
export const DefaultAgeRanges = {
  CHILD: { lower: 0, upper: 12 },
  EARLY_TEEN: { lower: 13, upper: 15 },
  LATE_TEEN: { lower: 16, upper: 17 },
  ADULT: { lower: 18, upper: null },
} as const;

/**
 * Helper functions for working with age signals
 */

/**
 * Check if error code suggests retrying is worthwhile
 * @param errorCode The error code from Age Signals API
 * @returns true if retrying might succeed
 */
export function shouldRetryError(errorCode: number | null): boolean {
  if (!errorCode) return false;
  
  const retryableErrors: number[] = [
    AgeSignalsErrorCode.API_NOT_AVAILABLE,
    AgeSignalsErrorCode.PLAY_STORE_NOT_FOUND,
    AgeSignalsErrorCode.NETWORK_ERROR,
    AgeSignalsErrorCode.PLAY_SERVICES_NOT_FOUND,
    AgeSignalsErrorCode.CANNOT_BIND_TO_SERVICE,
    AgeSignalsErrorCode.PLAY_STORE_VERSION_OUTDATED,
    AgeSignalsErrorCode.PLAY_SERVICES_VERSION_OUTDATED,
    AgeSignalsErrorCode.CLIENT_TRANSIENT_ERROR,
  ];
  
  return retryableErrors.includes(errorCode);
}

/**
 * Get a user-friendly error message for an error code
 * @param errorCode The error code from Age Signals API
 * @returns User-friendly error message
 */
export function getErrorMessage(errorCode: number | null): string {
  switch (errorCode) {
    case AgeSignalsErrorCode.API_NOT_AVAILABLE:
      return 'Age verification service not available. Please update Play Store.';
    case AgeSignalsErrorCode.PLAY_STORE_NOT_FOUND:
      return 'Play Store not found. Please install or enable Play Store.';
    case AgeSignalsErrorCode.NETWORK_ERROR:
      return 'No network connection. Please check your internet.';
    case AgeSignalsErrorCode.PLAY_SERVICES_NOT_FOUND:
      return 'Google Play Services not found. Please install or update it.';
    case AgeSignalsErrorCode.CANNOT_BIND_TO_SERVICE:
      return 'Cannot connect to Play Store service. Please try again.';
    case AgeSignalsErrorCode.PLAY_STORE_VERSION_OUTDATED:
      return 'Play Store is outdated. Please update to the latest version.';
    case AgeSignalsErrorCode.PLAY_SERVICES_VERSION_OUTDATED:
      return 'Google Play Services is outdated. Please update it.';
    case AgeSignalsErrorCode.CLIENT_TRANSIENT_ERROR:
      return 'Temporary error occurred. Please try again.';
    case AgeSignalsErrorCode.APP_NOT_OWNED:
      return 'App must be installed from Google Play Store.';
    case AgeSignalsErrorCode.INTERNAL_ERROR:
      return 'Internal error occurred. Please try again later.';
    default:
      return 'An error occurred while checking age status.';
  }
}

/**
 * Check if user is a supervised child
 * @param userStatus The user status from Age Signals API
 * @returns true if user is supervised
 */
export function isSupervisedUser(userStatus: string | null): boolean {
  if (!userStatus) return false;
  
  return (
    userStatus === AgeSignalsUserStatus.SUPERVISED ||
    userStatus === AgeSignalsUserStatus.SUPERVISED_APPROVAL_PENDING ||
    userStatus === AgeSignalsUserStatus.SUPERVISED_APPROVAL_DENIED
  );
}

/**
 * Check if user is verified adult (18+)
 * @param userStatus The user status from Age Signals API
 * @returns true if user is verified 18+
 */
export function isVerifiedAdult(userStatus: string | null): boolean {
  return userStatus === AgeSignalsUserStatus.VERIFIED;
}

/**
 * Check if user age is unknown
 * @param userStatus The user status from Age Signals API
 * @returns true if user age cannot be determined
 */
export function isUnknownAge(userStatus: string | null): boolean {
  return (
    userStatus === AgeSignalsUserStatus.UNKNOWN ||
    userStatus === AgeSignalsUserStatus.EMPTY ||
    userStatus === null
  );
}

/**
 * Check if user meets minimum age requirement
 * @param ageLower Lower bound of age range (null for unknown)
 * @param minimumAge Minimum age requirement
 * @returns true if user definitely meets minimum age, false if not or unknown
 */
export function meetsMinimumAge(
  ageLower: number | null,
  minimumAge: number
): boolean {
  // If we don't have age data, we can't confirm
  if (ageLower === null) return false;
  
  // If lower bound meets minimum, user definitely qualifies
  return ageLower >= minimumAge;
}

/**
 * Get age category from age range
 * @param ageLower Lower bound of age range
 * @param ageUpper Upper bound of age range (null for 18+)
 * @returns Age category string
 */
export function getAgeCategory(
  ageLower: number | null,
  ageUpper: number | null
): 'child' | 'teen' | 'adult' | 'unknown' {
  if (ageLower === null) return 'unknown';
  
  if (ageUpper === null || ageUpper >= 18) return 'adult';
  if (ageUpper >= 13) return 'teen';
  return 'child';
}

/**
 * Check if parental approval is needed
 * @param userStatus The user status from Age Signals API
 * @returns true if parental approval is pending or denied
 */
export function needsParentalApproval(userStatus: string | null): boolean {
  return (
    userStatus === AgeSignalsUserStatus.SUPERVISED_APPROVAL_PENDING ||
    userStatus === AgeSignalsUserStatus.SUPERVISED_APPROVAL_DENIED
  );
}

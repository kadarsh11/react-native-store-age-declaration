import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  getAndroidPlayAgeRangeStatus,
  requestIOSDeclaredAgeRange,
  type PlayAgeRangeStatusResult,
  type DeclaredAgeRangeResult,
} from './index';

/**
 * Unified age range result that works across both platforms
 */
export interface UnifiedAgeRangeResult {
  /**
   * Whether the age range data is currently being fetched
   */
  loading: boolean;

  /**
   * Error message if the operation failed
   */
  error: string | null;

  /**
   * Error code (Android only)
   */
  errorCode: number | null;

  /**
   * User/sharing status
   * 
   * Possible values:
   * - 'VERIFIED': User is over 18 (Android only)
   * - 'SUPERVISED': User has supervised account (Android only)
   * - 'SUPERVISED_APPROVAL_PENDING': Pending parent approval (Android only)
   * - 'SUPERVISED_APPROVAL_DENIED': Parent denied approval (Android only)
   * - 'UNKNOWN': User status unknown (Android only)
   * - 'sharing': User/parent agreed to share (iOS only)
   * - 'declined': User/parent declined to share (iOS only)
   * - null: No data available or error occurred
   */
  status: string | null;

  /**
   * Lower bound of the age range (inclusive)
   * Available on both platforms when sharing
   */
  ageLower: number | null;

  /**
   * Upper bound of the age range (inclusive)
   * Available on both platforms when sharing
   */
  ageUpper: number | null;

  /**
   * Most recent approval date for significant changes (Android only)
   * Format: ISO 8601 date string (YYYY-MM-DD)
   */
  mostRecentApprovalDate: string | null;

  /**
   * Parental controls status (iOS only)
   * - 'restricted': Age declared by parent/guardian
   * - null: Age declared by user or not sharing
   */
  parentControls: string | null;

  /**
   * Declaration type - who provided the age (iOS only)
   * - 'user_declared': User declared their own age
   * - 'parent_guardian_declared': Parent/guardian declared
   * - 'organizer_declared': Family organizer declared
   * - null: Not available
   */
  declaration: string | null;

  /**
   * Install ID for notifications (Android only)
   */
  installId: string | null;

  /**
   * Current platform ('android' | 'ios')
   */
  platform: 'android' | 'ios';

  /**
   * Raw response from the platform-specific API
   */
  rawResponse: PlayAgeRangeStatusResult | DeclaredAgeRangeResult | null;

  /**
   * Function to manually refresh/check the age range
   */
  refresh: () => Promise<void>;
}

/**
 * Configuration options for the useAgeRange hook
 */
export interface UseAgeRangeOptions {
  /**
   * Whether to automatically fetch age range on mount
   * @default true
   */
  autoFetch?: boolean;

  /**
   * iOS age thresholds (iOS only)
   * @default [13, 17, 21]
   */
  iosThresholds?: {
    first: number;
    second: number;
    third: number;
  };

  /**
   * Callback when age range is successfully fetched
   */
  onSuccess?: (result: UnifiedAgeRangeResult) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: string) => void;
}

/**
 * Custom React hook for unified age range checking across Android and iOS.
 * 
 * Automatically handles platform-specific APIs:
 * - Android: Uses Google Play Age Signals API
 * - iOS: Uses Declared Age Range API (iOS 26.0+)
 * 
 * @param options Configuration options
 * @returns Unified age range result with cross-platform data
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { loading, status, ageLower, ageUpper, error, refresh } = useAgeRange();
 * 
 *   if (loading) return <ActivityIndicator />;
 *   if (error) return <Text>Error: {error}</Text>;
 * 
 *   return (
 *     <View>
 *       <Text>Status: {status}</Text>
 *       <Text>Age Range: {ageLower} - {ageUpper}</Text>
 *       <Button title="Refresh" onPress={refresh} />
 *     </View>
 *   );
 * }
 * ```
 * 
 * @example With Android supervised user
 * ```typescript
 * const {
 *   status,              // 'SUPERVISED'
 *   ageLower,            // 13
 *   ageUpper,            // 15
 *   mostRecentApprovalDate, // '2026-01-01'
 *   installId            // 'uuid-string'
 * } = useAgeRange();
 * ```
 * 
 * @example With iOS sharing user
 * ```typescript
 * const {
 *   status,        // 'sharing'
 *   ageLower,      // 13
 *   ageUpper,      // 17
 *   declaration,   // 'user_declared'
 *   parentControls // null
 * } = useAgeRange({
 *   iosThresholds: { first: 13, second: 17, third: 21 }
 * });
 * ```
 */
export function useAgeRange(options: UseAgeRangeOptions = {}): UnifiedAgeRangeResult {
  const {
    autoFetch = true,
    iosThresholds = { first: 13, second: 15, third: 18 },
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [ageLower, setAgeLower] = useState<number | null>(null);
  const [ageUpper, setAgeUpper] = useState<number | null>(null);
  const [mostRecentApprovalDate, setMostRecentApprovalDate] = useState<string | null>(null);
  const [parentControls, setParentControls] = useState<string | null>(null);
  const [declaration, setDeclaration] = useState<string | null>(null);
  const [installId, setInstallId] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<PlayAgeRangeStatusResult | DeclaredAgeRangeResult | null>(null);

  const fetchAgeRange = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      if (Platform.OS === 'android') {
        // Android: Use Google Play Age Signals API
        const result = await getAndroidPlayAgeRangeStatus();
        setRawResponse(result);

        if (result.error) {
          setError(result.error);
          setErrorCode(result.errorCode);
          setStatus(null);
          setAgeLower(null);
          setAgeUpper(null);
          setMostRecentApprovalDate(null);
          setInstallId(null);
          
          if (onError) {
            onError(result.error);
          }
        } else {
          setStatus(result.userStatus);
          setAgeLower(result.ageLower);
          setAgeUpper(result.ageUpper);
          setMostRecentApprovalDate(result.mostRecentApprovalDate);
          setInstallId(result.installId);
          
          // iOS-specific fields are null on Android
          setParentControls(null);
          setDeclaration(null);

          const unifiedResult: UnifiedAgeRangeResult = {
            loading: false,
            error: null,
            errorCode: null,
            status: result.userStatus,
            ageLower: result.ageLower,
            ageUpper: result.ageUpper,
            mostRecentApprovalDate: result.mostRecentApprovalDate,
            parentControls: null,
            declaration: null,
            installId: result.installId,
            platform: 'android',
            rawResponse: result,
            refresh: fetchAgeRange,
          };

          if (onSuccess) {
            onSuccess(unifiedResult);
          }
        }
      } else if (Platform.OS === 'ios') {
        // iOS: Use Declared Age Range API
        const result = await requestIOSDeclaredAgeRange(
          iosThresholds.first,
          iosThresholds.second,
          iosThresholds.third
        );
        console.log("result",result)
        setRawResponse(result);

        setStatus(result.status);
        
        // if (result.status === 'sharing') {
          setAgeLower(result.lowerBound);
          setAgeUpper(result.upperBound);
          setParentControls(result.parentControls);
          setDeclaration(result.declaration);
          
        // } else {
          // setAgeLower(null);
          // setAgeUpper(null);
          // setParentControls(null);
          // setDeclaration(null);
        // }

        // Android-specific fields are null on iOS
        setMostRecentApprovalDate(null);
        setInstallId(null);

        const unifiedResult: UnifiedAgeRangeResult = {
          loading: false,
          error: null,
          errorCode: null,
          status: result.status,
          ageLower: result.lowerBound,
          ageUpper: result.upperBound,
          mostRecentApprovalDate: null,
          parentControls: result.parentControls,
          declaration: result.declaration,
          installId: null,
          platform: 'ios',
          rawResponse: result,
          refresh: fetchAgeRange,
        };

        if (onSuccess) {
          onSuccess(unifiedResult);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setStatus(null);
      setAgeLower(null);
      setAgeUpper(null);
      setMostRecentApprovalDate(null);
      setParentControls(null);
      setDeclaration(null);
      setInstallId(null);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [iosThresholds, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchAgeRange();
    }
  }, [autoFetch]); // Only run on mount if autoFetch is true

  return {
    loading,
    error,
    errorCode,
    status,
    ageLower,
    ageUpper,
    mostRecentApprovalDate,
    parentControls,
    declaration,
    installId,
    platform: Platform.OS as 'android' | 'ios',
    rawResponse,
    refresh: fetchAgeRange,
  };
}

/**
 * Helper function to check if user is an adult based on age range
 * 
 * @param result Unified age range result
 * @param adultAge Age threshold for adult (default: 18)
 * @returns true if user is definitely an adult, false otherwise
 * 
 * @example
 * ```typescript
 * const ageRange = useAgeRange();
 * const isAdult = isUserAdult(ageRange);
 * 
 * if (isAdult) {
 *   showAdultContent();
 * } else {
 *   showKidsContent();
 * }
 * ```
 */
export function isUserAdult(result: UnifiedAgeRangeResult, adultAge: number = 18): boolean {
  if (result.platform === 'android') {
    // Android: Check VERIFIED status or age range
    if (result.status === 'VERIFIED') {
      return true;
    }
    if (result.ageLower !== null && result.ageLower >= adultAge) {
      return true;
    }
    return false;
  } else {
    // iOS: Check age range
    if (result.status === 'sharing' && result.ageLower !== null && result.ageLower >= adultAge) {
      return true;
    }
    return false;
  }
}

/**
 * Helper function to check if user is supervised/has parental controls
 * 
 * @param result Unified age range result
 * @returns true if user has parental controls, false otherwise
 * 
 * @example
 * ```typescript
 * const ageRange = useAgeRange();
 * const hasParentalControls = isSupervised(ageRange);
 * 
 * if (hasParentalControls) {
 *   showSupervisedMessage();
 * }
 * ```
 */
export function isSupervised(result: UnifiedAgeRangeResult): boolean {
  if (result.platform === 'android') {
    return result.status === 'SUPERVISED' ||
           result.status === 'SUPERVISED_APPROVAL_PENDING' ||
           result.status === 'SUPERVISED_APPROVAL_DENIED';
  } else {
    return result.parentControls === 'restricted';
  }
}

/**
 * Helper function to get age range as formatted string
 * 
 * @param result Unified age range result
 * @returns Formatted age range string or null
 * 
 * @example
 * ```typescript
 * const ageRange = useAgeRange();
 * const rangeStr = getAgeRangeString(ageRange);
 * // Returns: "13-17" or "18+" or null
 * ```
 */
export function getAgeRangeString(result: UnifiedAgeRangeResult): string | null {
  if (result.ageLower === null) {
    return null;
  }

  if (result.ageUpper === null) {
    return `${result.ageLower}+`;
  }

  return `${result.ageLower}-${result.ageUpper}`;
}

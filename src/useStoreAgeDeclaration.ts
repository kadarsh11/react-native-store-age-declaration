import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import StoreAgeDeclaration from './NativeStoreAgeDeclaration';

export interface AgeDeclarationResult {
  /**
   * Status of the age declaration.
   * - 'verified': User is verified (Android)
   * - 'supervised': User is supervised (Android)
   * - 'sharing': User agreed to share age (iOS)
   * - 'declined': User declined to share age (iOS)
   * - 'unknown': Status unknown or not yet requested
   * - null: Initial state or error
   */
  status: string | null;

  /**
   * The declared age range.   
   * Contains lower and upper bounds if available.
   */
  ageRange: {
    lower: number | null;
    upper: number | null;
  } | null;

  /**
   * Date of the most recent approved significant change (Android only).
   * Format: YYYY-MM-DD
   */
  mostRecentApprovalDate: string | null;

  /**
   * Whether the operation is currently in progress.
   */
  loading: boolean;

  /**
   * Error message if the operation failed.
   */
  error: string | null;
}

export interface UseStoreAgeDeclarationOptions {
  /**
   * First age threshold for iOS Declared Age Range (e.g., 13).
   * Default: 13
   */
  iosFirstThreshold?: number;

  /**
   * Second age threshold for iOS Declared Age Range (e.g., 17).
   * Default: 17
   */
  iosSecondThreshold?: number;

  /**
   * Third age threshold for iOS Declared Age Range (e.g., 21).
   * Default: 21
   */
  iosThirdThreshold?: number;
}

/**
 * Custom hook to retrieve age declaration status across Android and iOS.
 * 
 * Unifies the response from:
 * - Android: Google Play Age Signals API
 * - iOS: Declared Age Range API
 * 
 * @param options Configuration options for iOS thresholds
 * @returns Object containing status, age range, approval date, loading state, and error
 */
export function useStoreAgeDeclaration(options: UseStoreAgeDeclarationOptions = {}) {
  const [result, setResult] = useState<AgeDeclarationResult>({
    status: null,
    ageRange: null,
    mostRecentApprovalDate: null,
    loading: false,
    error: null,
  });

  const checkAgeDeclaration = useCallback(async () => {
    setResult((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (Platform.OS === 'android') {
        const androidResult = await StoreAgeDeclaration.getAndroidPlayAgeRangeStatus();
        
        if (androidResult.error) {
          setResult({
            status: null,
            ageRange: null,
            mostRecentApprovalDate: null,
            loading: false,
            error: androidResult.error,
          });
        } else {
          setResult({
            status: androidResult.userStatus,
            ageRange: {
              lower: androidResult.ageLower,
              upper: androidResult.ageUpper,
            },
            mostRecentApprovalDate: androidResult.mostRecentApprovalDate,
            loading: false,
            error: null,
          });
        }
      } else if (Platform.OS === 'ios') {
        const {
          iosFirstThreshold = 13,
          iosSecondThreshold = 17,
          iosThirdThreshold = 21,
        } = options;

        try {
          const iosResult = await StoreAgeDeclaration.requestIOSDeclaredAgeRange(
            iosFirstThreshold,
            iosSecondThreshold,
            iosThirdThreshold
          );

          setResult({
            status: iosResult.status,
            ageRange: {
              lower: iosResult.lowerBound,
              upper: iosResult.upperBound,
            },
            mostRecentApprovalDate: null, // Not available on iOS
            loading: false,
            error: null,
          });
        } catch (e: any) {
          // Handle specific iOS errors or fallback
          setResult({
            status: null,
            ageRange: null,
            mostRecentApprovalDate: null,
            loading: false,
            error: e.message || 'Failed to request iOS age range',
          });
        }
      } else {
        setResult({
          status: null,
          ageRange: null,
          mostRecentApprovalDate: null,
          loading: false,
          error: 'Platform not supported',
        });
      }
    } catch (e: any) {
      setResult({
        status: null,
        ageRange: null,
        mostRecentApprovalDate: null,
        loading: false,
        error: e.message || 'An unexpected error occurred',
      });
    }
  }, [options.iosFirstThreshold, options.iosSecondThreshold, options.iosThirdThreshold]);

  return { ...result, checkAgeDeclaration };
}

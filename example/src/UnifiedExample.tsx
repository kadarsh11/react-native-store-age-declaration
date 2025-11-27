import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import {
  useAgeRange,
  isUserAdult,
  isSupervised,
  getAgeRangeString,
  type UnifiedAgeRangeResult,
} from 'react-native-store-age-declaration';

/**
 * Example component using the unified useAgeRange hook
 * Works automatically on both Android and iOS without platform checks
 */
export default function UnifiedAgeRangeExample() {
  // Use the unified hook - it automatically handles Android vs iOS
  const ageRange = useAgeRange({
    autoFetch: true,
    iosThresholds: {
      first: 13,
      second: 15,
      third: 18,
    },
    onSuccess: (result: UnifiedAgeRangeResult) => {
      console.log('✅ Age range fetched successfully:', result);
    },
    onError: (error: string) => {
      console.error('❌ Age range error:', error);
    },
  });

  const {
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
    platform,
    refresh,
  } = ageRange;

  console.log("ageLower",ageLower, "ageUpper", ageUpper)

  // Helper functions work across platforms
  const isAdult = isUserAdult(ageRange);
  const hasParentalControls = isSupervised(ageRange);
  const ageRangeStr = getAgeRangeString(ageRange);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Checking age range...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🎂 Unified Age Range Example</Text>
      <Text style={styles.subtitle}>Platform: {platform.toUpperCase()}</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          {errorCode && (
            <Text style={styles.errorCode}>Error Code: {errorCode}</Text>
          )}
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Status</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{status || 'N/A'}</Text>
            </View>
          </View>

          {/* Age Range Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Age Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Age Range:</Text>
              <Text style={styles.value}>{ageRangeStr || 'Not available'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Lower Bound:</Text>
              <Text style={styles.value}>{ageLower ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Upper Bound:</Text>
              <Text style={styles.value}>{ageUpper ?? 'N/A'}</Text>
            </View>
          </View>

          {/* Helper Results Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Analysis</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Is Adult (18+):</Text>
              <Text style={[styles.value, isAdult ? styles.success : styles.warning]}>
                {isAdult ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Has Parental Controls:</Text>
              <Text style={[styles.value, hasParentalControls ? styles.warning : styles.success]}>
                {hasParentalControls ? '⚠️ Yes' : '✅ No'}
              </Text>
            </View>
          </View>

          {/* Android-specific fields */}
          {platform === 'android' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 Android Details</Text>
              {installId && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Install ID:</Text>
                  <Text style={styles.valueSmall}>{installId}</Text>
                </View>
              )}
              {mostRecentApprovalDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Last Approval:</Text>
                  <Text style={styles.value}>{mostRecentApprovalDate}</Text>
                </View>
              )}
            </View>
          )}

          {/* iOS-specific fields */}
          {platform === 'ios' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍎 iOS Details</Text>
              {parentControls && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Parental Controls:</Text>
                  <Text style={styles.value}>{parentControls}</Text>
                </View>
              )}
              {declaration && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Declaration Type:</Text>
                  <Text style={styles.value}>{declaration}</Text>
                </View>
              )}
            </View>
          )}

          {/* Content Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Recommended Action</Text>
            <Text style={styles.recommendation}>
              {getContentRecommendation(ageRange)}
            </Text>
          </View>
        </View>
      )}

      {/* Refresh Button */}
      <View style={styles.buttonContainer}>
        <Button title="🔄 Refresh Age Range" onPress={refresh} color="#0066cc" />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ About This Hook</Text>
        <Text style={styles.infoText}>
          This example uses <Text style={styles.code}>useAgeRange()</Text> - a unified hook
          that works seamlessly on both Android and iOS without requiring platform checks.
        </Text>
        <Text style={styles.infoText}>
          • Android: Uses Google Play Age Signals API
        </Text>
        <Text style={styles.infoText}>
          • iOS: Uses Declared Age Range API (iOS 26+)
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Helper function to get content recommendations based on age range
 */
function getContentRecommendation(ageRange: UnifiedAgeRangeResult): string {
  if (ageRange.error) {
    return 'Unable to determine age. Show general content or require manual age verification.';
  }

  const isAdult = isUserAdult(ageRange);
  const hasParentalControls = isSupervised(ageRange);

  if (isAdult) {
    return '✅ Show all content including mature/adult content.';
  }

  if (hasParentalControls) {
    if (ageRange.platform === 'android') {
      if (ageRange.status === 'SUPERVISED_APPROVAL_PENDING') {
        return '⏳ Wait for parent approval before showing new features or significant changes.';
      }
      if (ageRange.status === 'SUPERVISED_APPROVAL_DENIED') {
        return '🚫 Parent denied approval. Restrict access to new features or changes.';
      }
    }
    return '👨‍👩‍👧‍👦 Show age-appropriate content. Parental controls are active.';
  }

  if (ageRange.ageLower !== null) {
    if (ageRange.ageUpper && ageRange.ageUpper < 13) {
      return '👶 Show kids content only (under 13).';
    }
    if (ageRange.ageUpper && ageRange.ageUpper < 18) {
      return '👦 Show teen content (13-17).';
    }
  }

  return '⚠️ Age unknown. Show general content or require age gate.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  errorCode: {
    fontSize: 12,
    color: '#c62828',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resultContainer: {
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  success: {
    color: '#4caf50',
  },
  warning: {
    color: '#ff9800',
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    color: '#d32f2f',
  },
});

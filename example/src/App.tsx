import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  multiply,
  getAndroidPlayAgeRangeStatus,
  requestIOSDeclaredAgeRange,
  type PlayAgeRangeStatusResult,
  type DeclaredAgeRangeResult,
} from 'react-native-store-age-declaration';

const result = multiply(3, 7);

export default function App() {
  const [androidStatus, setAndroidStatus] =
    useState<PlayAgeRangeStatusResult | null>(null);
  const [iosStatus, setIosStatus] = useState<DeclaredAgeRangeResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const checkAndroidAgeStatus = async () => {
    setLoading(true);
    try {
      const status = await getAndroidPlayAgeRangeStatus();
      console.log("🚀 ~ checkAndroidAgeStatus ~ status:", status);
      console.log("📊 Full Response Details:");
      console.log("  - userStatus:", status.userStatus);
      console.log("  - installId:", status.installId);
      console.log("  - ageLower:", status.ageLower);
      console.log("  - ageUpper:", status.ageUpper);
      console.log("  - mostRecentApprovalDate:", status.mostRecentApprovalDate);
      console.log("  - error:", status.error);
      console.log("  - errorCode:", status.errorCode);
      setAndroidStatus(status);
    } catch (error) {
      console.error('❌ Error checking Android age status:', error);
      setAndroidStatus({
        installId: null,
        userStatus: null,
        ageLower: null,
        ageUpper: null,
        mostRecentApprovalDate: null,
        error: String(error),
        errorCode: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIOSAgeStatus = async () => {
    setLoading(true);
    try {
      // Define age thresholds: 10, 13, 16
      const status = await requestIOSDeclaredAgeRange(10, 13, 16);
      setIosStatus(status);
    } catch (error) {
      console.error('Error checking iOS age status:', error);
      setIosStatus({
        status: 'error',
        parentControls: null,
        lowerBound: null,
        upperBound: null,
        declaration: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Age Declaration Example</Text>
      <Text style={styles.result}>Multiply Result: {result}</Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>

      {Platform.OS === 'android' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Android Age Signals</Text>
          <Button
            title="Check Android Age Status"
            onPress={checkAndroidAgeStatus}
            disabled={loading}
          />

          {loading && <ActivityIndicator style={styles.loader} />}

          {androidStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Age Signals Result:</Text>
              {androidStatus.error ? (
                <>
                  <Text style={styles.error}>❌ Error: {androidStatus.error}</Text>
                  {androidStatus.errorCode !== null && (
                    <Text style={styles.error}>
                      Error Code: {androidStatus.errorCode}
                    </Text>
                  )}
                  <Text style={styles.infoText}>
                    💡 Make sure you're using a device with Google Play Services
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <Text style={styles.statusValue}>
                      {androidStatus.userStatus || 'EMPTY'}
                    </Text>
                  </View>

                  {androidStatus.userStatus === 'VERIFIED' && (
                    <>
                      <Text style={styles.successText}>
                        ✓ User is verified 18+
                      </Text>
                      <Text style={styles.infoText}>
                        Age verified by ID, credit card, or facial estimation
                      </Text>
                    </>
                  )}

                  {(androidStatus.userStatus === 'SUPERVISED' ||
                    androidStatus.userStatus === 'SUPERVISED_APPROVAL_PENDING' ||
                    androidStatus.userStatus === 'SUPERVISED_APPROVAL_DENIED') && (
                    <>
                      <Text style={styles.successText}>
                        👨‍👩‍👧 Supervised Account (Family Link)
                      </Text>
                      
                      {androidStatus.ageLower !== null && androidStatus.ageUpper !== null && (
                        <View style={styles.statusRow}>
                          <Text style={styles.statusLabel}>Age Range:</Text>
                          <Text style={styles.statusValue}>
                            {androidStatus.ageLower}-{androidStatus.ageUpper} years
                          </Text>
                        </View>
                      )}
                      
                      {androidStatus.installId && (
                        <View style={styles.statusRow}>
                          <Text style={styles.statusLabel}>Install ID:</Text>
                          <Text style={styles.statusValue} numberOfLines={1}>
                            {androidStatus.installId.substring(0, 20)}...
                          </Text>
                        </View>
                      )}
                      
                      {androidStatus.mostRecentApprovalDate && (
                        <View style={styles.statusRow}>
                          <Text style={styles.statusLabel}>Last Approval:</Text>
                          <Text style={styles.statusValue}>
                            {androidStatus.mostRecentApprovalDate}
                          </Text>
                        </View>
                      )}

                      {androidStatus.userStatus === 'SUPERVISED_APPROVAL_PENDING' && (
                        <Text style={styles.warning}>
                          ⏳ Waiting for parent approval
                        </Text>
                      )}

                      {androidStatus.userStatus === 'SUPERVISED_APPROVAL_DENIED' && (
                        <Text style={styles.warning}>
                          🚫 Parent denied approval
                        </Text>
                      )}
                    </>
                  )}

                  {androidStatus.userStatus === 'UNKNOWN' && (
                    <>
                      <Text style={styles.warning}>
                        ❓ Age status unknown
                      </Text>
                      <Text style={styles.infoText}>
                        User may need to verify age in Play Store
                      </Text>
                    </>
                  )}

                  {androidStatus.userStatus === '' && (
                    <>
                      <Text style={styles.infoText}>
                        ℹ️ User has not set age status
                      </Text>
                      <Text style={styles.infoText}>
                        Consider showing manual age gate
                      </Text>
                    </>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>iOS Declared Age Range</Text>
          <Button
            title="Request iOS Age Declaration"
            onPress={checkIOSAgeStatus}
            disabled={loading}
          />

          {loading && <ActivityIndicator style={styles.loader} />}

          {iosStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Age Declaration Result:</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={styles.statusValue}>
                  {iosStatus.status || 'N/A'}
                </Text>
              </View>

              {iosStatus.status === 'sharing' && (
                <>
                  <Text style={styles.successText}>✓ User shared age information</Text>
                  
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Age Range:</Text>
                    <Text style={styles.statusValue}>
                      {iosStatus.lowerBound || '?'} - {iosStatus.upperBound || '?'} years
                    </Text>
                  </View>

                  {iosStatus.declaration && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Declared By:</Text>
                      <Text style={styles.statusValue}>
                        {iosStatus.declaration.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  )}

                  {iosStatus.parentControls && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Parental Controls:</Text>
                      <Text style={styles.statusValue}>{iosStatus.parentControls}</Text>
                    </View>
                  )}

                  <Text style={styles.infoText}>
                    {iosStatus.declaration === 'parent_guardian_declared' 
                      ? '👨‍👩‍👧 Age declared by parent/guardian'
                      : iosStatus.declaration === 'organizer_declared'
                      ? '👨‍👩‍👧 Age declared by family organizer'
                      : 'ℹ️ Age declared by user'}
                  </Text>
                </>
              )}

              {iosStatus.status === 'declined' && (
                <>
                  <Text style={styles.warning}>❌ User/parent declined to share age</Text>
                  <Text style={styles.infoText}>
                    Consider showing manual age verification or default content
                  </Text>
                </>
              )}

              <Text style={styles.infoText}>
                ⚠️ Requires iOS 26.0+ and com.apple.developer.declared-age-range entitlement
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor:'white'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  result: {
    fontSize: 16,
    marginBottom: 10,
  },
  platform: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  loader: {
    marginTop: 20,
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginVertical: 5,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginVertical: 5,
  },
  warning: {
    fontSize: 14,
    color: 'orange',
    marginTop: 5,
  },
  successText: {
    fontSize: 14,
    color: 'green',
    fontWeight: '600',
    marginTop: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginVertical: 2,
    fontStyle: 'italic',
  },
});

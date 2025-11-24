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
      setAndroidStatus(status);
    } catch (error) {
      console.error('Error checking Android age status:', error);
      setAndroidStatus({
        installId: null,
        userStatus: null,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIOSAgeStatus = async () => {
    setLoading(true);
    try {
      // Define age thresholds: 13, 17, 21
      const status = await requestIOSDeclaredAgeRange(13, 17, 21);
      setIosStatus(status);
    } catch (error) {
      console.error('Error checking iOS age status:', error);
      setIosStatus({
        status: 'error',
        parentControls: null,
        lowerBound: null,
        upperBound: null,
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
              <Text style={styles.statusTitle}>Age Range Status:</Text>
              {androidStatus.error ? (
                <Text style={styles.error}>Error: {androidStatus.error}</Text>
              ) : (
                <>
                  <Text style={styles.statusText}>
                    Install ID: {androidStatus.installId || 'N/A'}
                  </Text>
                  <Text style={styles.statusText}>
                    User Status: {androidStatus.userStatus || 'UNKNOWN'}
                  </Text>
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
              <Text style={styles.statusTitle}>Age Declaration:</Text>
              <Text style={styles.statusText}>
                Status: {iosStatus.status || 'N/A'}
              </Text>
              {iosStatus.status === 'sharing' && (
                <>
                  <Text style={styles.statusText}>
                    Age Range: {iosStatus.lowerBound || '?'} -{' '}
                    {iosStatus.upperBound || '?'}
                  </Text>
                  <Text style={styles.statusText}>
                    Parental Controls: {iosStatus.parentControls || 'None'}
                  </Text>
                </>
              )}
              {iosStatus.status === 'declined' && (
                <Text style={styles.warning}>User declined to share age</Text>
              )}
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
  },
  warning: {
    fontSize: 14,
    color: 'orange',
    marginTop: 5,
  },
});

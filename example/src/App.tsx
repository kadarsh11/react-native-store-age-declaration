import { useState } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import {
  multiply,
  getAndroidPlayAgeRangeStatus,
  type PlayAgeRangeStatusResult,
} from 'react-native-store-age-declaration';

const result = multiply(3, 7);

export default function App() {
  const [ageStatus, setAgeStatus] = useState<PlayAgeRangeStatusResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const checkAgeStatus = async () => {
    setLoading(true);
    try {
      const status = await getAndroidPlayAgeRangeStatus();
      setAgeStatus(status);
    } catch (error) {
      console.error('Error checking age status:', error);
      setAgeStatus({
        installId: null,
        userStatus: null,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Age Declaration Example</Text>
      <Text style={styles.result}>Multiply Result: {result}</Text>

      <View style={styles.section}>
        <Button
          title="Check Age Range Status"
          onPress={checkAgeStatus}
          disabled={loading}
        />

        {loading && <ActivityIndicator style={styles.loader} />}

        {ageStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Age Range Status:</Text>
            {ageStatus.error ? (
              <Text style={styles.error}>Error: {ageStatus.error}</Text>
            ) : (
              <>
                <Text style={styles.statusText}>
                  Install ID: {ageStatus.installId || 'N/A'}
                </Text>
                <Text style={styles.statusText}>
                  User Status: {ageStatus.userStatus || 'UNKNOWN'}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
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
    marginBottom: 20,
  },
  result: {
    fontSize: 16,
    marginBottom: 30,
  },
  section: {
    width: '100%',
    alignItems: 'center',
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
});

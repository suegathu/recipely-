import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

// Placeholder for presentation/document/DocumentScreen.kt — food journaling, future phase.
export function DocumentScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Food journal coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

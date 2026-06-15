import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

// Placeholder for presentation/account/AccountScreen.kt — auth & theme settings, future phase.
export function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Account coming soon</Text>
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

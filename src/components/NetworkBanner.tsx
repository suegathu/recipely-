import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNetworkStore } from '../store/networkStore';

// Mirrors presentation/components/NetworkContainer.kt
export function NetworkBanner() {
  const isConnected = useNetworkStore((state) => state.isConnected);
  const theme = useTheme();

  if (isConnected) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
      <MaterialIcons name="wifi-off" size={18} color={theme.colors.onErrorContainer} />
      <Text style={[styles.text, { color: theme.colors.onErrorContainer }]}>
        No Network Available
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

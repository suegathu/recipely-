import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface CategoryItemProps {
  title: string;
  image: string;
  onPress: () => void;
}

// Mirrors presentation/home/HomeScreen.kt#CategoryItem
export function CategoryItem({ title, image, onPress }: CategoryItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} contentFit="contain" />
      ) : (
        <MaterialIcons
          name="fastfood"
          size={32}
          color={theme.colors.onSurfaceVariant}
        />
      )}
      <Text variant="labelLarge" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  image: {
    width: 48,
    height: 48,
  },
  title: {
    fontWeight: 'bold',
  },
});

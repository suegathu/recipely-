import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface RecipeCardProps {
  title: string;
  image: string;
  onPress: () => void;
}

// Used in RecipesScreen / SearchScreen / BookmarksScreen grids
export function RecipeCard({ title, image, onPress }: RecipeCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      <View style={styles.titleContainer}>
        <Text variant="titleSmall" numberOfLines={2}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  titleContainer: {
    padding: 8,
  },
});

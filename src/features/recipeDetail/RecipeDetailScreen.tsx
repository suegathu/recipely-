import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from '../../data/db/client';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text, useTheme } from 'react-native-paper';
import { db } from '../../data/db/client';
import { recipeDetail } from '../../data/db/schema';
import { ensureRecipeDetail } from '../../data/repositories/recipeRepository';
import { isBookmarked, toggleBookmark } from '../../data/repositories/bookmarkRepository';
import type { RootStackParamList } from '../../navigation/types';

// Mirrors presentation/recipeDetail/RecipeDetailScreen.kt
export function RecipeDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RecipeDetail'>>();
  const { recipeId } = route.params;
  const theme = useTheme();

  const { data: rows } = useLiveQuery(
    db.select().from(recipeDetail).where(eq(recipeDetail.recipeId, recipeId)),
    [recipeId],
  );
  const recipe = rows[0];

  const [isLoading, setIsLoading] = useState(!recipe);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (recipe) {
      setIsLoading(false);
      setBookmarked(isBookmarked(recipe.recipeId));
      return;
    }
    setIsLoading(true);
    ensureRecipeDetail(recipeId)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [recipeId, recipe]);

  if (isLoading || !recipe) {
    return (
      <View style={styles.center}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        </Appbar.Header>
        <ActivityIndicator />
      </View>
    );
  }

  const ingredients: string[] = JSON.parse(recipe.ingredients);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} contentFit="cover" />
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          <Appbar.Content title="" />
          <Appbar.Action
            icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
            color="#fff"
            onPress={() => {
              toggleBookmark(recipe);
              setBookmarked(!bookmarked);
            }}
          />
        </Appbar.Header>
      </View>

      <View style={styles.content}>
        <Text variant="headlineSmall">{recipe.title}</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {recipe.country}
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Ingredients
        </Text>
        {ingredients.map((ingredient, index) => (
          <Text key={index} variant="bodyMedium" style={styles.ingredient}>
            {`• ${ingredient}`}
          </Text>
        ))}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Instructions
        </Text>
        <Text variant="bodyMedium">{recipe.instructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    gap: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  ingredient: {
    paddingVertical: 2,
  },
});

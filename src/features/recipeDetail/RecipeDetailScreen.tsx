import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from '../../data/db/client';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Text, useTheme } from 'react-native-paper';
import { db } from '../../data/db/client';
import { recipeDetail } from '../../data/db/schema';
import { toRecipeDetail } from '../../data/api/mappers';
import { mealdbApi } from '../../data/api/mealdbApi';
import { ensureRecipeDetail } from '../../data/repositories/recipeRepository';
import { isBookmarked, toggleBookmark } from '../../data/repositories/bookmarkRepository';
import type { RootStackParamList } from '../../navigation/types';

type RecipeDetailRow = typeof recipeDetail.$inferSelect;

export function RecipeDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RecipeDetail'>>();
  const { recipeId } = route.params;
  const theme = useTheme();

  // Native: live query from SQLite cache
  const { data: rows } = useLiveQuery(
    db.select().from(recipeDetail).where(eq(recipeDetail.recipeId, recipeId)),
    [recipeId],
  );

  // Web: fetch directly from API (SQLite unavailable on web)
  const [webRecipe, setWebRecipe] = useState<RecipeDetailRow | null>(null);

  const recipe: RecipeDetailRow | undefined = Platform.OS === 'web' ? (webRecipe ?? undefined) : rows[0];

  const [isLoading, setIsLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(true);
      mealdbApi.getRecipeDetail(recipeId)
        .then((res) => {
          const dto = res.meals?.[0];
          if (dto) setWebRecipe(toRecipeDetail(dto));
        })
        .catch(() => undefined)
        .finally(() => setIsLoading(false));
      return;
    }

    if (recipe) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    ensureRecipeDetail(recipeId)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [recipeId, recipe]);

  useEffect(() => {
    if (recipe) {
      setBookmarked(isBookmarked(recipe.recipeId));
    }
  }, [recipe]);

  const handleBookmark = () => {
    if (!recipe) return;
    toggleBookmark(recipe);
    setBookmarked((b) => !b);
  };

  if (isLoading || !recipe) {
    return (
      <View style={styles.center}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        </Appbar.Header>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const ingredients: string[] = JSON.parse(recipe.ingredients);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} contentFit="cover" />
          <Appbar.Header style={styles.overlayHeader}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          </Appbar.Header>
        </View>

        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>{recipe.title}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {recipe.country}
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ingredient, index) => (
            <Text key={index} variant="bodyMedium" style={styles.ingredient}>
              {`• ${ingredient}`}
            </Text>
          ))}

          <Text variant="titleMedium" style={styles.sectionTitle}>Instructions</Text>
          <Text variant="bodyMedium" style={styles.instructions}>{recipe.instructions}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button
          mode={bookmarked ? 'contained' : 'outlined'}
          icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
          onPress={handleBookmark}
          style={styles.bookmarkBtn}
          contentStyle={styles.bookmarkBtnContent}
        >
          {bookmarked ? 'Saved' : 'Save recipe'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  center: { flex: 1 },
  imageContainer: { height: 280 },
  image: { width: '100%', height: '100%' },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  content: { padding: 16, gap: 4 },
  title: { fontWeight: 'bold', marginBottom: 2 },
  sectionTitle: { marginTop: 20, marginBottom: 8, fontWeight: '600' },
  ingredient: { paddingVertical: 3 },
  instructions: { lineHeight: 24 },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bookmarkBtn: { borderRadius: 8 },
  bookmarkBtnContent: { height: 48 },
});

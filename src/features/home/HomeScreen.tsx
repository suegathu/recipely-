import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLiveQuery } from '../../data/db/client';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper';
import { CategoryItem } from '../../components/CategoryItem';
import { NetworkBanner } from '../../components/NetworkBanner';
import { db } from '../../data/db/client';
import { categories } from '../../data/db/schema';
import {
  ensureDayRecipe,
  fetchRandomRecipeDetail,
  refreshCategories,
} from '../../data/repositories/recipeRepository';
import type { RootStackParamList } from '../../navigation/types';

// Mirrors presentation/home/HomeScreen.kt
export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const { data: categoryRows } = useLiveQuery(db.select().from(categories));

  const [dayRecipe, setDayRecipe] = useState<Awaited<ReturnType<typeof ensureDayRecipe>>>();
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  useEffect(() => {
    if (categoryRows.length === 0) {
      refreshCategories().catch(() => undefined);
    }
  }, [categoryRows.length]);

  useEffect(() => {
    ensureDayRecipe()
      .then(setDayRecipe)
      .catch(() => undefined);
  }, []);

  const handleRandomRecipe = async () => {
    setIsLoadingRandom(true);
    try {
      const recipe = await fetchRandomRecipeDetail();
      navigation.navigate('RecipeDetail', { recipeId: recipe.recipeId });
    } catch {
      // No network and no cache — silently ignore for this phase.
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <View style={styles.container}>
      <NetworkBanner />

      <FlatList
        data={categoryRows}
        keyExtractor={(item) => item.categoryId}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Text variant="titleLarge" style={styles.welcome}>
                Welcome
              </Text>
              <IconButton icon="magnify" onPress={() => navigation.navigate('Search')} />
            </View>

            {dayRecipe && (
              <Pressable
                onPress={() =>
                  navigation.navigate('RecipeDetail', { recipeId: dayRecipe.recipeId })
                }
                style={styles.dayRecipe}
              >
                <Image source={{ uri: dayRecipe.image }} style={styles.dayRecipeImage} contentFit="cover" />
                <View style={styles.dayRecipeOverlay}>
                  <Text variant="bodyLarge" style={styles.dayRecipeLabel}>
                    Recipe of the Day
                  </Text>
                  <Text variant="headlineSmall" style={styles.dayRecipeTitle}>
                    {dayRecipe.title}
                  </Text>
                </View>
              </Pressable>
            )}

            <Pressable
              onPress={handleRandomRecipe}
              style={[styles.randomRecipe, { backgroundColor: theme.colors.surface }]}
            >
              <MaterialIcons name="fastfood" size={32} color={theme.colors.onSurfaceVariant} />
              <View style={styles.randomRecipeText}>
                <Text variant="titleMedium">Random Recipe</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Don't know what to cook?
                </Text>
              </View>
              {isLoadingRandom ? (
                <ActivityIndicator size="small" />
              ) : (
                <View style={[styles.randomRecipeIcon, { backgroundColor: theme.colors.primary }]}>
                  <MaterialIcons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
                </View>
              )}
            </Pressable>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Categories
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CategoryItem
            title={item.title}
            image={item.image}
            onPress={() =>
              navigation.navigate('Recipes', { categoryId: item.categoryId, categoryName: item.title })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcome: {
    fontWeight: 'bold',
  },
  dayRecipe: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  dayRecipeImage: {
    width: '100%',
    height: '100%',
  },
  dayRecipeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dayRecipeLabel: {
    color: 'rgba(255,255,255,0.7)',
  },
  dayRecipeTitle: {
    color: '#fff',
  },
  randomRecipe: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  randomRecipeText: {
    flex: 1,
  },
  randomRecipeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
  },
});

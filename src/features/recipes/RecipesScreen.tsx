import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from '../../data/db/client';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';
import { RecipeCard } from '../../components/RecipeCard';
import { NetworkBanner } from '../../components/NetworkBanner';
import { db } from '../../data/db/client';
import { recipes } from '../../data/db/schema';
import { refreshCategoryRecipes } from '../../data/repositories/recipeRepository';
import type { RootStackParamList } from '../../navigation/types';

// Mirrors presentation/recipes/RecipesScreen.kt
export function RecipesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Recipes'>>();
  const { categoryId, categoryName } = route.params;

  const { data: categoryRecipes } = useLiveQuery(
    db.select().from(recipes).where(eq(recipes.categoryId, categoryId)),
    [categoryId],
  );

  const [isLoading, setIsLoading] = useState(categoryRecipes.length === 0);

  useEffect(() => {
    if (categoryRecipes.length > 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    refreshCategoryRecipes(categoryId, categoryName)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [categoryId, categoryName, categoryRecipes.length]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={categoryName} />
      </Appbar.Header>

      <NetworkBanner />

      {isLoading && categoryRecipes.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : categoryRecipes.length === 0 ? (
        <View style={styles.loading}>
          <Text variant="titleMedium">No recipes found</Text>
        </View>
      ) : (
        <FlatList
          data={categoryRecipes}
          keyExtractor={(item) => item.recipeId}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              image={item.image}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipeId })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
  },
});

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Chip, Searchbar, Text } from 'react-native-paper';
import { RecipeCard } from '../../components/RecipeCard';
import { searchRecipes, type SearchFilters } from '../../data/repositories/recipeRepository';
import type { RootStackParamList } from '../../navigation/types';

type RecipeDetailRow = Awaited<ReturnType<typeof searchRecipes>>[number];

// Mirrors presentation/search/SearchScreen.kt
export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    title: true,
    cuisine: false,
    ingredient: false,
  });
  const [results, setResults] = useState<RecipeDetailRow[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchRecipes(searchTerm, filters)
        .then(setResults)
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, filters]);

  const toggleFilter = (key: keyof SearchFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Search" />
      </Appbar.Header>

      <Searchbar
        placeholder="Search recipes"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchbar}
      />

      <View style={styles.chips}>
        <Chip selected={filters.title} onPress={() => toggleFilter('title')}>
          Title
        </Chip>
        <Chip selected={filters.cuisine} onPress={() => toggleFilter('cuisine')}>
          Cuisine
        </Chip>
        <Chip selected={filters.ingredient} onPress={() => toggleFilter('ingredient')}>
          Ingredient
        </Chip>
      </View>

      {searchTerm.trim().length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium">Search by title, cuisine, or ingredient</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium">No results found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
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
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  empty: {
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

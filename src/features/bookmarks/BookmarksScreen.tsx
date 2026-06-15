import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RecipeCard } from '../../components/RecipeCard';
import { bookmarksQuery } from '../../data/repositories/bookmarkRepository';
import type { RootStackParamList } from '../../navigation/types';

// Mirrors presentation/bookmark/BookmarkScreen.kt
export function BookmarksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: bookmarks } = useLiveQuery(bookmarksQuery());

  if (bookmarks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="titleMedium">No bookmarks</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarks}
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
  );
}

const styles = StyleSheet.create({
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

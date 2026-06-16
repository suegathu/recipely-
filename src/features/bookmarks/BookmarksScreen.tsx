import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { RecipeCard } from '../../components/RecipeCard';
import { useBookmarks } from '../../data/repositories/bookmarkRepository';
import type { RootStackParamList } from '../../navigation/types';

export function BookmarksScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bookmarks = useBookmarks();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={styles.header}>
        Bookmarks
      </Text>
      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="bookmark-border" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No bookmarks yet.{'\n'}Tap the bookmark icon on any recipe to save it here.
          </Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { fontWeight: 'bold', padding: 16, paddingBottom: 12 },
  list: { padding: 16, gap: 12 },
  row: { gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { textAlign: 'center', lineHeight: 24 },
});

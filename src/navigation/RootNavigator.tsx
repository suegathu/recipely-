import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RecipeDetailScreen } from '../features/recipeDetail/RecipeDetailScreen';
import { RecipesScreen } from '../features/recipes/RecipesScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Mirrors presentation/navigation/Navigation.kt — bottom-tab screens plus
// Recipes/RecipeDetail/Search pushed on top from any tab.
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

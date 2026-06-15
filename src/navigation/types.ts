import type { NavigatorScreenParams } from '@react-navigation/native';

// Mirrors presentation/navigation/Screen.kt — bottom-nav destinations
export type RootTabParamList = {
  Home: undefined;
  Document: undefined;
  Bookmarks: undefined;
  Account: undefined;
};

// Mirrors the top-level NavHost routes in presentation/navigation/Navigation.kt.
// Recipes/RecipeDetail/Search are pushed on top of the tab bar from any tab.
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined;
  Recipes: { categoryId: string; categoryName: string };
  RecipeDetail: { recipeId: string };
  Search: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

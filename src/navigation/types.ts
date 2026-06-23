import type { NavigatorScreenParams } from '@react-navigation/native';

// Mirrors presentation/navigation/Screen.kt — bottom-nav destinations
export type RootTabParamList = {
  Home: undefined;
  Shop: undefined;
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

  // Marketplace
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  CheckoutAddress: undefined;
  CheckoutShipping: undefined;
  CheckoutPayment: { orderId: string; paymentUrl: string };
  CheckoutConfirmation: { orderId: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  VendorRegister: undefined;
  VendorProfile: { vendorId: string };
  AddressBook: undefined;
  AddressForm: { addressId?: string };
  RecipeIngredientShop: { recipeId: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

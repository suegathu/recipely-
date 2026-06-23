import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddressBookScreen } from '../features/address/AddressBookScreen';
import { AddressFormScreen } from '../features/address/AddressFormScreen';
import { CartScreen } from '../features/cart/CartScreen';
import { CheckoutAddressScreen } from '../features/checkout/CheckoutAddressScreen';
import { CheckoutConfirmationScreen } from '../features/checkout/CheckoutConfirmationScreen';
import { CheckoutPaymentScreen } from '../features/checkout/CheckoutPaymentScreen';
import { CheckoutShippingScreen } from '../features/checkout/CheckoutShippingScreen';
import { OrderDetailScreen } from '../features/orders/OrderDetailScreen';
import { OrderHistoryScreen } from '../features/orders/OrderHistoryScreen';
import { OrderTrackingScreen } from '../features/orders/OrderTrackingScreen';
import { RecipeDetailScreen } from '../features/recipeDetail/RecipeDetailScreen';
import { RecipesScreen } from '../features/recipes/RecipesScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { ProductDetailScreen } from '../features/shop/ProductDetailScreen';
import { RecipeIngredientShopScreen } from '../features/shop/RecipeIngredientShopScreen';
import { VendorProfileScreen } from '../features/shop/VendorProfileScreen';
import { VendorRegisterScreen } from '../features/vendor/VendorRegisterScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddressBook" component={AddressBookScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
      <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="CheckoutAddress" component={CheckoutAddressScreen} />
      <Stack.Screen name="CheckoutShipping" component={CheckoutShippingScreen} />
      <Stack.Screen name="CheckoutPayment" component={CheckoutPaymentScreen} />
      <Stack.Screen name="CheckoutConfirmation" component={CheckoutConfirmationScreen} />
      <Stack.Screen name="RecipeIngredientShop" component={RecipeIngredientShopScreen} />
    </Stack.Navigator>
  );
}

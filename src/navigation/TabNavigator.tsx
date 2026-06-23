import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AccountScreen } from '../features/account/AccountScreen';
import { BookmarksScreen } from '../features/bookmarks/BookmarksScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { ShopScreen } from '../features/shop/ShopScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  Shop: 'storefront',
  Bookmarks: 'bookmark',
  Account: 'person',
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

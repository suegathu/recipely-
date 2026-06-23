import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Text, useTheme } from 'react-native-paper';
import { CartBadge } from '../../components/CartBadge';
import type { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { matchIngredientsToProducts, type IngredientMatch } from '../../utils/ingredientMatcher';
import { useLiveQuery } from '../../data/db/client';
import { recipeDetail } from '../../data/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../../data/db/client';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'RecipeIngredientShop'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RecipeIngredientShopScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { recipeId } = route.params;
  const addItem = useCartStore((s) => s.addItem);

  const { data: details } = useLiveQuery(db.select().from(recipeDetail).where(eq(recipeDetail.recipeId, recipeId)));
  const recipe = details?.[0];

  const ingredients: string[] = useMemo(() => {
    if (!recipe?.ingredients) return [];
    try {
      return JSON.parse(recipe.ingredients);
    } catch {
      return [];
    }
  }, [recipe?.ingredients]);

  const [matches, setMatches] = useState<IngredientMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ingredients.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    matchIngredientsToProducts(ingredients).then((result) => {
      setMatches(result);
      setIsLoading(false);
    });
  }, [ingredients]);

  const available = matches.filter((m) => m.product);
  const unavailable = matches.filter((m) => !m.product && m.normalized);

  const handleAddAll = () => {
    let count = 0;
    for (const match of available) {
      if (match.product) {
        addItem({ id: match.product.id, vendorId: match.product.vendor_id, name: match.product.name, imageURLs: match.product.image_urls, price: match.product.price });
        count++;
      }
    }
    Alert.alert('Added to Cart', `${count} ingredients added to your cart`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleAddSingle = (match: IngredientMatch) => {
    if (match.product) {
      addItem({ id: match.product.id, vendorId: match.product.vendor_id, name: match.product.name, imageURLs: match.product.image_urls, price: match.product.price });
      Alert.alert('Added', `${match.product.name} added to cart`);
    }
  };

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Buy Ingredients" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">Recipe not found in cache</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Buy Ingredients" />
        <CartBadge onPress={() => navigation.navigate('Cart')} />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="titleMedium" style={styles.recipeName}>{recipe.title}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
            {ingredients.length} ingredients · {available.length} available in marketplace
          </Text>

          {available.length > 0 && (
            <Button mode="contained" onPress={handleAddAll} style={styles.addAllButton} contentStyle={styles.addAllContent} icon="cart-plus">
              Add All Available ({available.length}) to Cart
            </Button>
          )}

          {available.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Available ({available.length})</Text>
              {available.map((match, i) => (
                <View key={i} style={[styles.matchCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Image source={{ uri: match.product!.image_urls[0] }} style={styles.matchImage} contentFit="cover" />
                  <View style={styles.matchInfo}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{match.raw}</Text>
                    <Text variant="titleSmall">{match.product!.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      KES {match.product!.price}/{match.product!.unit}
                    </Text>
                  </View>
                  <Button compact mode="contained-tonal" onPress={() => handleAddSingle(match)}>Add</Button>
                </View>
              ))}
            </View>
          )}

          {unavailable.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Not Available ({unavailable.length})</Text>
              {unavailable.map((match, i) => (
                <View key={i} style={[styles.unavailableRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                  <MaterialIcons name="remove-circle-outline" size={18} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>{match.raw}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  recipeName: { fontWeight: 'bold' },
  addAllButton: { borderRadius: 12, marginBottom: 20 },
  addAllContent: { height: 44 },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  matchCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, gap: 10, marginBottom: 8 },
  matchImage: { width: 50, height: 50, borderRadius: 8 },
  matchInfo: { flex: 1, gap: 2 },
  unavailableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1 },
});

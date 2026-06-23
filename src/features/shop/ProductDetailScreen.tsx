import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { QuantitySelector } from '../../components/QuantitySelector';
import { CartBadge } from '../../components/CartBadge';
import type { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { useMarketplaceStore } from '../../store/marketplaceStore';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProductDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { productId } = route.params;

  const product = useMarketplaceStore((s) => s.getProduct(productId));
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Not Found" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">Product not found</Text>
        </View>
      </View>
    );
  }

  const vendor = useMarketplaceStore((s) => s.getVendor(product.vendor_id));

  const handleAddToCart = () => {
    addItem({ id: product.id, vendorId: product.vendor_id, name: product.name, imageURLs: product.image_urls, price: product.price }, quantity);
    Alert.alert('Added to Cart', `${quantity}x ${product.name} added to your cart`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="" />
        <CartBadge onPress={() => navigation.navigate('Cart')} />
      </Appbar.Header>

      <ScrollView>
        <Image source={{ uri: product.image_urls?.[0] }} style={styles.image} contentFit="cover" />

        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text variant="headlineMedium" style={[styles.price, { color: theme.colors.primary }]}>
              KES {product.price.toLocaleString()}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              per {product.unit}
            </Text>
          </View>

          <View style={styles.tags}>
            <Chip compact icon="check-circle" style={styles.stockChip}>
              {product.stock_quantity} in stock
            </Chip>
            <Chip compact>{product.category}</Chip>
          </View>

          <Divider style={styles.divider} />

          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {product.description}
          </Text>

          <Divider style={styles.divider} />

          {vendor && (
            <Pressable
              style={styles.vendorRow}
              onPress={() => navigation.navigate('VendorProfile', { vendorId: vendor.id })}
            >
              <MaterialIcons name="storefront" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall">{vendor.business_name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  ★ {vendor.rating} · {vendor.total_orders} orders
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          )}

          <Divider style={styles.divider} />

          <View style={styles.quantityRow}>
            <Text variant="titleMedium">Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => Math.min(q + 1, product.stock_quantity))}
              onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
              max={product.stock_quantity}
            />
          </View>

          <Text variant="bodySmall" style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Total: KES {(product.price * quantity).toLocaleString()}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button mode="contained" onPress={handleAddToCart} style={styles.addButton} contentStyle={styles.addButtonContent} icon="cart-plus">
          Add to Cart · KES {(product.price * quantity).toLocaleString()}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', aspectRatio: 1.2 },
  content: { padding: 16 },
  name: { fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  price: { fontWeight: 'bold' },
  tags: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stockChip: {},
  divider: { marginVertical: 16 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { textAlign: 'right', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1 },
  addButton: { borderRadius: 12 },
  addButtonContent: { height: 48 },
});

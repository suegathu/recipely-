import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { EmptyState } from '../../components/EmptyState';
import { QuantitySelector } from '../../components/QuantitySelector';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { items, updateQuantity, removeItem, clearCart, subtotal, getVendorGroups } = useCartStore();
  const getVendor = useMarketplaceStore((s) => s.getVendor);

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Cart" />
        </Appbar.Header>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          message="Browse the marketplace and add items to your cart"
          actionLabel="Shop Now"
          onAction={() => navigation.navigate('Tabs', { screen: 'Shop' })}
        />
      </View>
    );
  }

  const vendorGroups = getVendorGroups();
  const total = subtotal();

  const handleCheckout = () => {
    navigation.navigate('CheckoutAddress');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Cart (${items.length} items)`} />
        <Appbar.Action icon="delete-outline" onPress={() => {
          Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ]);
        }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.list}>
        {vendorGroups.map((group) => {
          const vendor = getVendor(group.vendorId);
          return (
            <View key={group.vendorId} style={[styles.vendorGroup, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="titleSmall" style={styles.vendorName}>
                {vendor?.business_name ?? 'Unknown Vendor'}
              </Text>

              {group.items.map((item) => (
                <View key={item.productId}>
                  <View style={styles.itemRow}>
                    <Image source={{ uri: item.imageURL }} style={styles.itemImage} contentFit="cover" />
                    <View style={styles.itemInfo}>
                      <Text variant="bodyMedium" numberOfLines={2}>{item.name}</Text>
                      <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        KES {(item.price * item.quantity).toLocaleString()}
                      </Text>
                      <QuantitySelector
                        quantity={item.quantity}
                        onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
                        onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
                      />
                    </View>
                    <IconButton
                      icon="close"
                      size={18}
                      onPress={() => removeItem(item.productId)}
                    />
                  </View>
                  <Divider />
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.totalRow}>
          <Text variant="titleMedium">Subtotal</Text>
          <Text variant="headlineSmall" style={[styles.totalPrice, { color: theme.colors.primary }]}>
            KES {total.toLocaleString()}
          </Text>
        </View>
        <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton} contentStyle={styles.checkoutContent}>
          Proceed to Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 16 },
  vendorGroup: { borderRadius: 12, padding: 12, gap: 8 },
  vendorName: { fontWeight: 'bold', marginBottom: 4 },
  itemRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemInfo: { flex: 1, gap: 4 },
  footer: { padding: 16, borderTopWidth: 1, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontWeight: 'bold' },
  checkoutButton: { borderRadius: 12 },
  checkoutContent: { height: 48 },
});

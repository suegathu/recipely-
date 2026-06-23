import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_SHIPPING = { cost: 250, eta: '45-60 min', distance: 8.3 };
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export function CheckoutShippingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const cartSubtotal = useCartStore((s) => s.subtotal());
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const createLocalOrder = useOrderStore((s) => s.createOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartSubtotal + MOCK_SHIPPING.cost;

  const handleProceedToPayment = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Get user's default address
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.uid)
        .order('is_default', { ascending: false })
        .limit(1);

      const address = addresses?.[0] ?? { label: 'Default', street_address: 'N/A', city: 'Nairobi', county: 'Nairobi' };

      // Create order in Supabase
      const orderItems = cartItems.map((i) => ({
        productId: i.productId,
        vendorId: i.vendorId,
        name: i.name,
        imageURL: i.imageURL,
        price: i.price,
        quantity: i.quantity,
      }));

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        customer_id: user.uid,
        status: 'pending_payment',
        items: orderItems,
        subtotal: cartSubtotal,
        shipping_cost: MOCK_SHIPPING.cost,
        total_amount: total,
        currency: 'KES',
        shipping_address: {
          label: address.label,
          streetAddress: address.street_address,
          city: address.city,
          county: address.county,
          phone: address.phone,
        },
      }).select('id').single();

      if (orderError || !order) {
        throw new Error(orderError?.message ?? 'Failed to create order');
      }

      // Also track locally
      createLocalOrder({
        items: cartItems.map((i) => ({ name: i.name, imageURL: i.imageURL, price: i.price, quantity: i.quantity })),
        subtotal: cartSubtotal,
        shippingCost: MOCK_SHIPPING.cost,
        address: { label: address.label, streetAddress: address.street_address, city: address.city, county: address.county },
      });

      clearCart();

      // Try to get Pesapal payment URL
      let paymentUrl = '';
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/pesapal-submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });

        if (res.ok) {
          const data = await res.json();
          paymentUrl = data.paymentUrl ?? '';
        }
      } catch (e) {
        console.warn('Pesapal not available, using mock payment:', e);
      }

      navigation.navigate('CheckoutPayment', { orderId: order.id, paymentUrl });

    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Shipping" />
      </Appbar.Header>

      <View style={styles.steps}>
        <Chip style={styles.stepChip}>1. Address</Chip>
        <Chip selected style={styles.stepChip}>2. Shipping</Chip>
        <Chip style={styles.stepChip}>3. Payment</Chip>
      </View>

      <View style={styles.content}>
        <Card style={styles.quoteCard}>
          <Card.Content>
            <View style={styles.quoteHeader}>
              <MaterialIcons name="local-shipping" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Sendy Delivery</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Estimated time</Text>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{MOCK_SHIPPING.eta}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Distance</Text>
              <Text variant="bodyMedium">{MOCK_SHIPPING.distance} km</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Delivery fee</Text>
              <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>KES {MOCK_SHIPPING.cost}</Text>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <View style={styles.summary}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal ({cartItems.length} items)</Text>
            <Text variant="bodyMedium">KES {cartSubtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Delivery</Text>
            <Text variant="bodyMedium">KES {MOCK_SHIPPING.cost}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.summaryRow}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total</Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>KES {total.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button
          mode="contained"
          onPress={handleProceedToPayment}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.payButton}
          contentStyle={styles.payContent}
          icon="credit-card"
        >
          Pay KES {total.toLocaleString()}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  steps: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  stepChip: {},
  content: { flex: 1, padding: 16 },
  quoteCard: { marginBottom: 16 },
  quoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { marginVertical: 16 },
  summary: { gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { padding: 16, borderTopWidth: 1 },
  payButton: { borderRadius: 12 },
  payContent: { height: 48 },
});

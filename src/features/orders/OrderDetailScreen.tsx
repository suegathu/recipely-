import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Divider, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_STEPS = [
  { key: 'pending_payment', label: 'Payment Pending', icon: 'hourglass-empty' as const },
  { key: 'paid', label: 'Paid', icon: 'check-circle' as const },
  { key: 'processing', label: 'Processing', icon: 'sync' as const },
  { key: 'shipped', label: 'Shipped', icon: 'local-shipping' as const },
  { key: 'delivered', label: 'Delivered', icon: 'done-all' as const },
];

export function OrderDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      setOrder(data);
      setIsLoading(false);
    })();
  }, [orderId]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Order" />
        </Appbar.Header>
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Order Not Found" />
        </Appbar.Header>
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const date = new Date(order.created_at);
  const items = order.items as { name: string; imageURL: string; price: number; quantity: number }[];
  const address = order.shipping_address as { label: string; streetAddress: string; city: string; county: string } | null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Order #${order.id.slice(0, 8)}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Order Status</Text>
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const color = isCompleted ? theme.colors.primary : theme.colors.onSurfaceVariant;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <MaterialIcons name={isCompleted ? 'check-circle' : 'radio-button-unchecked'} size={22} color={color} />
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: isCompleted ? theme.colors.primary : theme.colors.outlineVariant }]} />
                  )}
                </View>
                <Text variant={isCurrent ? 'titleSmall' : 'bodyMedium'} style={{ color, fontWeight: isCurrent ? 'bold' : 'normal' }}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Items</Text>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Image source={{ uri: item.imageURL }} style={styles.itemImage} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Qty: {item.quantity} × KES {item.price.toLocaleString()}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                KES {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">KES {Number(order.subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Delivery</Text>
            <Text variant="bodyMedium">KES {Number(order.shipping_cost).toLocaleString()}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.summaryRow}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>Total</Text>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              KES {Number(order.total_amount).toLocaleString()}
            </Text>
          </View>
        </View>

        {address && (
          <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Delivery Address</Text>
            <Text variant="bodyMedium">{address.label}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {address.streetAddress}, {address.city}, {address.county}
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Order Info</Text>
          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Order ID</Text>
            <Text variant="bodySmall">{order.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Date</Text>
            <Text variant="bodySmall">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          {order.pesapal_payment_status && (
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Payment</Text>
              <Text variant="bodySmall">{order.pesapal_payment_status}</Text>
            </View>
          )}
        </View>

        {(order.status === 'shipped' || order.status === 'processing') && (
          <Button mode="contained" icon="local-shipping" onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })} style={styles.trackButton} contentStyle={{ height: 48 }}>
            Track Delivery
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  section: { borderRadius: 12, padding: 14, gap: 6 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 36 },
  stepIndicator: { alignItems: 'center', width: 22 },
  stepLine: { width: 2, height: 14, marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  itemImage: { width: 44, height: 44, borderRadius: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  trackButton: { borderRadius: 12 },
});

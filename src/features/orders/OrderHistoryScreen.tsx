import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Chip, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  pending_payment: { label: 'Pending Payment', color: '#F59E0B', icon: 'hourglass-empty' },
  paid: { label: 'Paid', color: '#10B981', icon: 'check-circle' },
  processing: { label: 'Processing', color: '#3B82F6', icon: 'sync' },
  shipped: { label: 'Shipped', color: '#8B5CF6', icon: 'local-shipping' },
  delivered: { label: 'Delivered', color: '#059669', icon: 'done-all' },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: 'cancel' },
};

interface OrderRow {
  id: string;
  status: string;
  items: { name: string; imageURL: string; price: number; quantity: number }[];
  total_amount: number;
  created_at: string;
}

export function OrderHistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, status, items, total_amount, created_at')
      .eq('customer_id', user.uid)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchOrders);
    return unsub;
  }, [navigation, fetchOrders]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Order History" />
        </Appbar.Header>
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Order History" />
        </Appbar.Header>
        <EmptyState
          icon="receipt-long"
          title="No orders yet"
          message="Your order history will appear here once you make your first purchase"
          actionLabel="Browse Shop"
          onAction={() => navigation.navigate('Tabs', { screen: 'Shop' })}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Order History" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.list}>
        {orders.map((order) => {
          const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending_payment;
          const date = new Date(order.created_at);
          const items = order.items as OrderRow['items'];

          return (
            <Pressable
              key={order.id}
              style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>#{order.id.slice(0, 8)}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Chip
                  compact
                  icon={() => <MaterialIcons name={config.icon} size={14} color={config.color} />}
                  style={{ backgroundColor: `${config.color}20` }}
                  textStyle={{ color: config.color, fontSize: 12 }}
                >
                  {config.label}
                </Chip>
              </View>

              <View style={styles.itemsPreview}>
                {items.slice(0, 3).map((item, i) => (
                  <Image key={i} source={{ uri: item.imageURL }} style={styles.thumbImage} contentFit="cover" />
                ))}
                {items.length > 3 && (
                  <View style={[styles.moreThumb, { backgroundColor: theme.colors.primary }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onPrimary }}>+{items.length - 3}</Text>
                  </View>
                )}
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    KES {Number(order.total_amount).toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 14, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemsPreview: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumbImage: { width: 40, height: 40, borderRadius: 8 },
  moreThumb: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

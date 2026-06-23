import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import type { RootStackParamList } from '../../navigation/types';
import { useOrderStore } from '../../store/orderStore';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'CheckoutConfirmation'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutConfirmationScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;
  const order = useOrderStore((s) => s.getOrder(orderId));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="check-circle" size={80} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
            Order Confirmed!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Order #{orderId}
          </Text>
        </View>

        {order && (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Order Summary</Text>

            {order.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>{item.quantity}x {item.name}</Text>
                <Text variant="bodyMedium">KES {(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}

            <Divider style={{ marginVertical: 8 }} />

            <View style={styles.itemRow}>
              <Text variant="bodyMedium">Subtotal</Text>
              <Text variant="bodyMedium">KES {order.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text variant="bodyMedium">Delivery</Text>
              <Text variant="bodyMedium">KES {order.shippingCost.toLocaleString()}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.itemRow}>
              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>Total Paid</Text>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                KES {order.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {order && (
          <View style={[styles.addressCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>Delivering to</Text>
            <Text variant="bodyMedium">{order.shippingAddress.label}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {order.shippingAddress.streetAddress}, {order.shippingAddress.city}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue Shopping
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('OrderHistory')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            View Orders
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 24 },
  header: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  title: { fontWeight: 'bold' },
  summaryCard: { borderRadius: 12, padding: 16 },
  addressCard: { borderRadius: 12, padding: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  actions: { gap: 12, marginTop: 8 },
  button: { borderRadius: 12 },
  buttonContent: { height: 48 },
});

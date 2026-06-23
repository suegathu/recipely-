import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { Appbar, Card, Text, useTheme } from 'react-native-paper';
import type { RootStackParamList } from '../../navigation/types';
import { useOrderStore } from '../../store/orderStore';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

const TRACKING_STEPS = [
  { label: 'Order confirmed', time: '2 min ago', done: true },
  { label: 'Rider assigned', time: '1 min ago', done: true },
  { label: 'Picked up from vendor', time: 'In progress', done: false },
  { label: 'On the way to you', time: '', done: false },
  { label: 'Delivered', time: '', done: false },
];

export function OrderTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;
  const order = useOrderStore((s) => s.getOrder(orderId));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Track Delivery" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.etaCard}>
          <Card.Content style={styles.etaContent}>
            <MaterialIcons name="local-shipping" size={40} color={theme.colors.primary} />
            <View>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                45-60 min
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Estimated delivery time
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={[styles.timeline, { backgroundColor: theme.colors.surfaceVariant }]}>
          {TRACKING_STEPS.map((step, i) => {
            const color = step.done ? theme.colors.primary : theme.colors.onSurfaceVariant;
            const isLast = i === TRACKING_STEPS.length - 1;

            return (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <MaterialIcons
                    name={step.done ? 'check-circle' : 'radio-button-unchecked'}
                    size={22}
                    color={color}
                  />
                  {!isLast && (
                    <View style={[styles.stepLine, { backgroundColor: step.done ? theme.colors.primary : theme.colors.outlineVariant }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color, fontWeight: step.done ? 'bold' : 'normal' }}>
                    {step.label}
                  </Text>
                  {step.time ? (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {step.time}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Delivery Details</Text>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Order</Text>
              <Text variant="bodySmall">#{orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Powered by</Text>
              <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Sendy</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Distance</Text>
              <Text variant="bodySmall">8.3 km</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 16 },
  etaCard: {},
  etaContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timeline: { borderRadius: 12, padding: 14, gap: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 40 },
  stepIndicator: { alignItems: 'center', width: 22 },
  stepLine: { width: 2, height: 18, marginTop: 2 },
  infoCard: {},
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});

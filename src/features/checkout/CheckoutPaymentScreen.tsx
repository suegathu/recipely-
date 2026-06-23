import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import type { RootStackParamList } from '../../navigation/types';
import { useOrderStore } from '../../store/orderStore';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'CheckoutPayment'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutPaymentScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { orderId, paymentUrl } = route.params;
  const completePayment = useOrderStore((s) => s.completePayment);
  const order = useOrderStore((s) => s.getOrder(orderId));
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const hasPesapalUrl = paymentUrl && paymentUrl.startsWith('http');

  const handleMockPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      completePayment(orderId);
      setPaid(true);
      setProcessing(false);
    }, 2000);
  };

  const handleWebViewNavigationChange = (navState: { url: string }) => {
    if (navState.url.includes('pesapal-status') || navState.url.includes('callback')) {
      setPaid(true);
      completePayment(orderId);
    }
  };

  useEffect(() => {
    if (paid) {
      const timer = setTimeout(() => {
        navigation.navigate('CheckoutConfirmation', { orderId });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [paid, orderId, navigation]);

  if (hasPesapalUrl && !paid) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Pesapal Payment" />
        </Appbar.Header>
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleWebViewNavigationChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" />
              <Text variant="bodyMedium" style={{ marginTop: 12 }}>Loading payment page...</Text>
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Payment" />
      </Appbar.Header>

      <View style={styles.content}>
        {paid ? (
          <View style={styles.center}>
            <MaterialIcons name="check-circle" size={80} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
              Payment Successful!
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Redirecting to confirmation...
            </Text>
          </View>
        ) : processing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text variant="titleMedium" style={styles.title}>Processing Payment...</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Please wait while we process your payment
            </Text>
          </View>
        ) : (
          <View style={styles.center}>
            <MaterialIcons name="credit-card" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="headlineSmall" style={styles.title}>
              KES {order?.totalAmount.toLocaleString() ?? '0'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 8 }}>
              {hasPesapalUrl
                ? 'Redirecting to Pesapal...'
                : 'Pesapal payment will open here once the backend is connected.\nUse mock payment for now.'}
            </Text>

            <View style={styles.methods}>
              <Button
                mode="contained"
                onPress={handleMockPayment}
                style={styles.methodButton}
                contentStyle={styles.methodContent}
                icon="cellphone"
              >
                Pay with M-Pesa (Mock)
              </Button>
              <Button
                mode="outlined"
                onPress={handleMockPayment}
                style={styles.methodButton}
                contentStyle={styles.methodContent}
                icon="credit-card-outline"
              >
                Pay with Card (Mock)
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontWeight: 'bold', marginTop: 8 },
  methods: { width: '100%', gap: 12, marginTop: 16 },
  methodButton: { borderRadius: 12 },
  methodContent: { height: 48 },
  webviewLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});

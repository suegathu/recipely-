import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Chip, RadioButton, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface AddressRow {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  city: string;
  county: string;
  postal_code: string;
  is_default: boolean;
}

export function CheckoutAddressScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.uid)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchAddresses);
    return unsub;
  }, [navigation, fetchAddresses]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Delivery Address" />
      </Appbar.Header>

      <View style={styles.steps}>
        <Chip selected style={styles.stepChip}>1. Address</Chip>
        <Chip style={styles.stepChip}>2. Shipping</Chip>
        <Chip style={styles.stepChip}>3. Payment</Chip>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {addresses.length === 0 ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 32 }}>
              No addresses yet. Add one to continue.
            </Text>
          ) : (
            addresses.map((addr) => (
              <Pressable
                key={addr.id}
                onPress={() => setSelectedId(addr.id)}
                style={[
                  styles.card,
                  { backgroundColor: theme.colors.surfaceVariant },
                  selectedId === addr.id && { borderColor: theme.colors.primary, borderWidth: 2 },
                ]}
              >
                <View style={styles.cardRow}>
                  <RadioButton value={addr.id} status={selectedId === addr.id ? 'checked' : 'unchecked'} onPress={() => setSelectedId(addr.id)} />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{addr.label}</Text>
                    <Text variant="bodyMedium">{addr.recipient_name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{addr.street_address}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{addr.city}, {addr.county} {addr.postal_code}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{addr.phone}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}

          <Button mode="outlined" icon="plus" onPress={() => navigation.navigate('AddressForm', {})} style={styles.addButton}>
            Add New Address
          </Button>
        </ScrollView>
      )}

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CheckoutShipping')}
          disabled={!selectedId}
          style={styles.continueButton}
          contentStyle={styles.continueContent}
        >
          Continue to Shipping
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  stepChip: {},
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'transparent' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  addButton: { marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
  continueButton: { borderRadius: 12 },
  continueContent: { height: 48 },
});

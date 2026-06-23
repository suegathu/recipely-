import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Chip, FAB, IconButton, Text, useTheme } from 'react-native-paper';
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

export function AddressBookScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      if (!error && data) setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchAddresses);
    return unsubscribe;
  }, [navigation, fetchAddresses]);

  const handleDelete = (address: AddressRow) => {
    Alert.alert('Delete Address', `Remove "${address.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('addresses').delete().eq('id', address.id);
          setAddresses((prev) => prev.filter((a) => a.id !== address.id));
        },
      },
    ]);
  };

  const renderAddress = ({ item }: { item: AddressRow }) => (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={() => navigation.navigate('AddressForm', { addressId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.labelRow}>
          <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.label}>{item.label}</Text>
          {item.is_default && <Chip compact mode="flat" style={styles.defaultChip}>Default</Chip>}
        </View>
        <IconButton icon="delete-outline" size={20} onPress={() => handleDelete(item)} />
      </View>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.recipient_name}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.street_address}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.city}, {item.county} {item.postal_code}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.phone}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Addresses" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="location-off" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>No addresses saved</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Add a delivery address to get started</Text>
        </View>
      ) : (
        <FlatList data={addresses} renderItem={renderAddress} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('AddressForm', {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontWeight: 'bold' },
  defaultChip: { height: 24 },
  fab: { position: 'absolute', bottom: 24, right: 24 },
});

import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Chip, Text, useTheme } from 'react-native-paper';
import { ProductCard } from '../../components/ProductCard';
import type { RootStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'VendorProfile'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VendorProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { vendorId } = route.params;

  const vendor = useMarketplaceStore((s) => s.getVendor(vendorId));
  const products = useMarketplaceStore((s) => s.getVendorProducts(vendorId));

  if (!vendor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Not Found" />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={vendor.business_name} />
      </Appbar.Header>

      <ScrollView>
        {vendor.cover_image_url && (
          <Image source={{ uri: vendor.cover_image_url }} style={styles.cover} contentFit="cover" />
        )}

        <View style={styles.info}>
          <View style={styles.headerRow}>
            {vendor.logo_url && (
              <Image source={{ uri: vendor.logo_url }} style={styles.logo} contentFit="cover" />
            )}
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={styles.name}>{vendor.business_name}</Text>
              <View style={styles.statsRow}>
                <Chip compact icon="star">★ {vendor.rating}</Chip>
                <Chip compact icon="shopping">{vendor.total_orders} orders</Chip>
              </View>
            </View>
          </View>

          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
            {vendor.description}
          </Text>

          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {vendor.city}, {vendor.county}
            </Text>
          </View>
        </View>

        <View style={styles.products}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Products ({products.length})
          </Text>
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  name={product.name}
                  image={product.image_urls?.[0] ?? ''}
                  price={product.price}
                  unit={product.unit}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                />
              </View>
            ))}
            {products.length % 2 !== 0 && <View style={styles.gridItem} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { width: '100%', height: 180 },
  info: { padding: 16 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logo: { width: 56, height: 56, borderRadius: 28 },
  name: { fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  products: { padding: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', flexGrow: 0, flexShrink: 0, flexBasis: '47%' },
});

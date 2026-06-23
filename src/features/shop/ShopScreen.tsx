import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import { CartBadge } from '../../components/CartBadge';
import { ProductCard } from '../../components/ProductCard';
import { PRODUCT_CATEGORIES } from '../../data/mock/commerceMock';
import type { RootStackParamList } from '../../navigation/types';
import { useMarketplaceStore } from '../../store/marketplaceStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ShopScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { filteredProducts, featuredProducts, selectedCategory, searchQuery, search, filterByCategory, loadProducts, loadVendors, getVendor, isLoading } = useMarketplaceStore();

  useEffect(() => {
    loadProducts();
    loadVendors();
  }, []);

  const showFeatured = !selectedCategory && !searchQuery;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Marketplace" />
        <CartBadge onPress={() => navigation.navigate('Cart')} />
      </Appbar.Header>

      {isLoading && filteredProducts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
      <ScrollView stickyHeaderIndices={[1]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search ingredients, products..."
            value={searchQuery}
            onChangeText={search}
            style={styles.searchbar}
          />
        </View>

        <View style={{ backgroundColor: theme.colors.background }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            <Chip
              selected={!selectedCategory}
              onPress={() => filterByCategory(null)}
              style={styles.chip}
            >
              All
            </Chip>
            {PRODUCT_CATEGORIES.map((cat) => (
              <Chip
                key={cat.key}
                selected={selectedCategory === cat.key}
                onPress={() => filterByCategory(selectedCategory === cat.key ? null : cat.key)}
                style={styles.chip}
              >
                {cat.icon} {cat.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {showFeatured && featuredProducts.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Featured & Meal Kits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
              {featuredProducts.map((product) => (
                <View key={product.id} style={styles.featuredCard}>
                  <ProductCard
                    name={product.name}
                    image={product.image_urls?.[0] ?? ''}
                    price={product.price}
                    unit={product.unit}
                    vendorName={getVendor(product.vendor_id)?.business_name}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? PRODUCT_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? 'Products' : 'All Products'}
          </Text>
          {filteredProducts.length === 0 ? (
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No products found. Try a different search.
            </Text>
          ) : (
            <View style={styles.grid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard
                    name={product.name}
                    image={product.image_urls?.[0] ?? ''}
                    price={product.price}
                    unit={product.unit}
                    vendorName={getVendor(product.vendor_id)?.business_name}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                  />
                </View>
              ))}
              {filteredProducts.length % 2 !== 0 && <View style={styles.gridItem} />}
            </View>
          )}
        </View>
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchbar: { elevation: 0 },
  categories: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { marginRight: 0 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  featuredList: { gap: 12, paddingRight: 16 },
  featuredCard: { width: 160 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', flexGrow: 0, flexShrink: 0, flexBasis: '47%' },
  emptyText: { textAlign: 'center', paddingVertical: 32 },
});

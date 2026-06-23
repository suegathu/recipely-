import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  unit: string;
  vendorName?: string;
  onPress: () => void;
}

export function ProductCard({ name, image, price, unit, vendorName, onPress }: ProductCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      <View style={styles.info}>
        <Text variant="titleSmall" numberOfLines={2}>{name}</Text>
        {vendorName && (
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {vendorName}
          </Text>
        )}
        <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
          KES {price.toLocaleString()}/{unit}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: 8,
    gap: 2,
  },
});

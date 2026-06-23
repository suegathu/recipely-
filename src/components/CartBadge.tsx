import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Badge, useTheme } from 'react-native-paper';
import { useCartStore } from '../store/cartStore';

interface CartBadgeProps {
  onPress: () => void;
}

export function CartBadge({ onPress }: CartBadgeProps) {
  const theme = useTheme();
  const count = useCartStore((s) => s.itemCount());

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <MaterialIcons name="shopping-cart" size={24} color={theme.colors.onSurface} />
      {count > 0 && (
        <Badge style={styles.badge} size={18}>{count}</Badge>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  badge: { position: 'absolute', top: 2, right: 2 },
});

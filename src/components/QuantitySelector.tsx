import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ quantity, onIncrement, onDecrement, min = 1, max = 99 }: QuantitySelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <IconButton
        icon="minus"
        size={18}
        mode="outlined"
        onPress={onDecrement}
        disabled={quantity <= min}
      />
      <Text variant="titleMedium" style={styles.count}>{quantity}</Text>
      <IconButton
        icon="plus"
        size={18}
        mode="outlined"
        onPress={onIncrement}
        disabled={quantity >= max}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

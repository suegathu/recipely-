import React, { useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import {
  Checkbox,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {
  addShoppingItem,
  clearCheckedItems,
  deleteShoppingItem,
  toggleShoppingItem,
  useShoppingItems,
  type ShoppingItem,
} from '../../data/repositories/shoppingRepository';
import { useAuthStore } from '../../store/authStore';

export function DocumentScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const items = useShoppingItems(user?.uid ?? '');
  const [newText, setNewText] = useState('');
  const inputRef = useRef<any>(null);

  const hasChecked = items.some((i) => i.checked);

  const handleAdd = () => {
    const text = newText.trim();
    if (!text || !user) return;
    addShoppingItem(user.uid, text);
    setNewText('');
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.row}>
      <Checkbox
        status={item.checked ? 'checked' : 'unchecked'}
        onPress={() => toggleShoppingItem(item.id, item.checked)}
        color={theme.colors.primary}
      />
      <Text
        variant="bodyLarge"
        style={[
          styles.itemText,
          item.checked && { textDecorationLine: 'line-through', color: theme.colors.outline },
        ]}
        onPress={() => toggleShoppingItem(item.id, item.checked)}
      >
        {item.text}
      </Text>
      <IconButton
        icon="close"
        size={18}
        iconColor={theme.colors.outline}
        onPress={() => deleteShoppingItem(item.id)}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Shopping List
        </Text>
        {hasChecked && (
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.primary }}
            onPress={() => user && clearCheckedItems(user.uid)}
          >
            Clear done
          </Text>
        )}
      </View>

      <Divider />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Your list is empty.{'\n'}Add items below.
            </Text>
          </View>
        }
      />

      <Divider />
      <View style={[styles.addBar, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          ref={inputRef}
          value={newText}
          onChangeText={setNewText}
          placeholder="Add an item…"
          mode="flat"
          style={styles.addInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <IconButton
          icon="plus"
          size={24}
          iconColor={newText.trim() ? theme.colors.primary : theme.colors.outline}
          onPress={handleAdd}
          disabled={!newText.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: { fontWeight: 'bold' },
  list: { paddingVertical: 8 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  itemText: { flex: 1 },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addInput: { flex: 1, backgroundColor: 'transparent', fontSize: 16 },
});

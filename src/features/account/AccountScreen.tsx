import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text, useTheme } from 'react-native-paper';
import { useBookmarks } from '../../data/repositories/bookmarkRepository';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function MenuRow({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <MaterialIcons name={icon} size={24} color={theme.colors.onSurface} />
      <Text variant="bodyLarge" style={{ flex: 1 }}>{label}</Text>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

export function AccountScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuthStore();
  const bookmarks = useBookmarks();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.profile}>
        {user?.photoURL ? (
          <Avatar.Image size={80} source={{ uri: user.photoURL }} />
        ) : (
          <Avatar.Text size={80} label={initials} />
        )}
        <Text variant="titleLarge" style={styles.name}>
          {user?.displayName ?? 'Welcome'}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
            {bookmarks.length}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Bookmarks
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.menu}>
        <MenuRow icon="receipt-long" label="Order History" onPress={() => navigation.navigate('OrderHistory')} />
        <MenuRow icon="location-on" label="My Addresses" onPress={() => navigation.navigate('AddressBook')} />
        <MenuRow icon="storefront" label="Become a Vendor" onPress={() => navigation.navigate('VendorRegister')} />
      </View>

      <Divider style={styles.divider} />

      <Button
        mode="outlined"
        onPress={signOut}
        style={styles.signOutBtn}
        icon="logout"
      >
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  profile: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  name: { fontWeight: 'bold', marginTop: 8 },
  divider: { marginVertical: 24 },
  stats: { flexDirection: 'row', justifyContent: 'center' },
  stat: { alignItems: 'center', gap: 4 },
  statNumber: { fontWeight: 'bold' },
  menu: { gap: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 4 },
  signOutBtn: { marginBottom: 32 },
});

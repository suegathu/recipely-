import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text, useTheme } from 'react-native-paper';
import { useBookmarks } from '../../data/repositories/bookmarkRepository';
import { useAuthStore } from '../../store/authStore';

export function AccountScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const bookmarks = useBookmarks();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <Button
        mode="outlined"
        onPress={signOut}
        style={styles.signOutBtn}
        icon="logout"
      >
        Sign out
      </Button>
    </View>
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
  signOutBtn: { marginTop: 'auto' },
});

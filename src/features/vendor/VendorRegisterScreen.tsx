import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, TextInput, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VendorRegisterScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = businessName && phone && email && city && county && streetAddress;

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setIsSubmitting(true);

    try {
      const { data: existing } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_id', user.uid)
        .single();

      if (existing) {
        Alert.alert('Already Registered', 'You already have a vendor account.');
        setIsSubmitting(false);
        return;
      }

      const { data: vendor, error } = await supabase.from('vendors').insert({
        owner_id: user.uid,
        business_name: businessName,
        description,
        phone,
        email,
        status: 'pending',
        street_address: streetAddress,
        city,
        county,
      }).select('id').single();

      if (error) throw error;

      await supabase.from('user_profiles').update({
        role: 'vendor',
        vendor_id: vendor.id,
        updated_at: new Date().toISOString(),
      }).eq('uid', user.uid);

      Alert.alert(
        'Application Submitted',
        'Your vendor application has been submitted for review. We\'ll notify you once it\'s approved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Become a Vendor" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.form}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          Join our marketplace and start selling your ingredients and meal kits to home cooks across Kenya.
        </Text>

        <Text variant="titleSmall" style={styles.sectionLabel}>Business Info</Text>
        <TextInput label="Business Name *" value={businessName} onChangeText={setBusinessName} mode="outlined" />
        <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} />

        <Text variant="titleSmall" style={styles.sectionLabel}>Contact</Text>
        <TextInput label="Phone Number *" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" placeholder="+254..." />
        <TextInput label="Business Email *" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" />

        <Text variant="titleSmall" style={styles.sectionLabel}>Pickup Location</Text>
        <TextInput label="Street Address *" value={streetAddress} onChangeText={setStreetAddress} mode="outlined" />
        <TextInput label="City / Town *" value={city} onChangeText={setCity} mode="outlined" />
        <TextInput label="County *" value={county} onChangeText={setCounty} mode="outlined" placeholder="e.g. Nairobi" />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
          icon="storefront"
        >
          Submit Application
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16, gap: 12 },
  sectionLabel: { fontWeight: 'bold', marginTop: 8 },
  submitButton: { marginTop: 16, borderRadius: 12 },
  submitContent: { height: 48 },
});

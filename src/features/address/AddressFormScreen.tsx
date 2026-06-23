import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { supabase } from '../../auth/supabase';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'AddressForm'>['route'];
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AddressFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const user = useAuthStore((s) => s.user);
  const addressId = route.params?.addressId;
  const isEditing = Boolean(addressId);

  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditing);

  useEffect(() => {
    if (!addressId) return;
    (async () => {
      const { data } = await supabase.from('addresses').select('*').eq('id', addressId).single();
      if (data) {
        setLabel(data.label);
        setRecipientName(data.recipient_name);
        setPhone(data.phone);
        setStreetAddress(data.street_address);
        setCity(data.city);
        setCounty(data.county);
        setPostalCode(data.postal_code ?? '');
        setIsDefault(data.is_default);
      }
      setIsLoadingExisting(false);
    })();
  }, [addressId]);

  const handleSave = async () => {
    if (!recipientName || !phone || !streetAddress || !city || !county || !user) return;
    setIsSaving(true);
    try {
      if (isDefault) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.uid).eq('is_default', true);
      }

      const data = {
        user_id: user.uid,
        label,
        recipient_name: recipientName,
        phone,
        street_address: streetAddress,
        city,
        county,
        postal_code: postalCode,
        is_default: isDefault,
      };

      if (isEditing && addressId) {
        await supabase.from('addresses').update(data).eq('id', addressId);
      } else {
        await supabase.from('addresses').insert(data);
      }

      if (isDefault) {
        const { data: newAddr } = await supabase.from('addresses').select('id').eq('user_id', user.uid).eq('is_default', true).single();
        if (newAddr) {
          await supabase.from('user_profiles').update({ default_address_id: newAddr.id }).eq('uid', user.uid);
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = recipientName && phone && streetAddress && city && county;

  if (isLoadingExisting) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Address' : 'New Address'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.labelPicker}>
          {['Home', 'Work', 'Other'].map((option) => (
            <Button key={option} mode={label === option ? 'contained' : 'outlined'} compact onPress={() => setLabel(option)} style={styles.labelButton}>
              {option}
            </Button>
          ))}
        </View>

        <TextInput label="Recipient Name *" value={recipientName} onChangeText={setRecipientName} mode="outlined" />
        <TextInput label="Phone Number *" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" placeholder="+254..." />
        <TextInput label="Street Address *" value={streetAddress} onChangeText={setStreetAddress} mode="outlined" multiline />
        <TextInput label="City / Town *" value={city} onChangeText={setCity} mode="outlined" />
        <TextInput label="County *" value={county} onChangeText={setCounty} mode="outlined" placeholder="e.g. Nairobi" />
        <TextInput label="Postal Code" value={postalCode} onChangeText={setPostalCode} mode="outlined" keyboardType="numeric" />

        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Set as default address</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>

        <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={!isValid || isSaving} style={styles.saveButton}>
          {isEditing ? 'Update Address' : 'Save Address'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16, gap: 16 },
  labelPicker: { flexDirection: 'row', gap: 8 },
  labelButton: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  saveButton: { marginTop: 8 },
});

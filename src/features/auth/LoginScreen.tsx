import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { auth } from '../../auth/firebase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export function LoginScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .catch((e) => setError(friendlyError(e.code)))
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleEmailAuth = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    if (Platform.OS === 'web') {
      setLoading(true);
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (e: any) {
        setError(friendlyError(e.code));
      } finally {
        setLoading(false);
      }
    } else {
      promptAsync();
    }
  };

  const googleEnabled = Platform.OS === 'web' || (!!GOOGLE_WEB_CLIENT_ID && !!request);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text variant="displaySmall" style={[styles.logo, { color: theme.colors.primary }]}>
          Recipely
        </Text>
        <Text variant="bodyMedium" style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
          Discover, cook, and save your favourite recipes.
        </Text>

        <View style={styles.tabs}>
          <Button
            mode={tab === 'login' ? 'contained' : 'outlined'}
            onPress={() => setTab('login')}
            style={styles.tabBtn}
            compact
          >
            Sign in
          </Button>
          <Button
            mode={tab === 'register' ? 'contained' : 'outlined'}
            onPress={() => setTab('register')}
            style={styles.tabBtn}
            compact
          >
            Register
          </Button>
        </View>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleEmailAuth}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) : tab === 'login' ? (
            'Sign in'
          ) : (
            'Create account'
          )}
        </Button>

        {googleEnabled && (
          <>
            <Divider style={styles.divider} />
            <Button
              mode="outlined"
              onPress={handleGoogle}
              disabled={loading}
              icon="google"
              style={styles.googleBtn}
              contentStyle={styles.primaryBtnContent}
            >
              Continue with Google
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user': return '';
    default: return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logo: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  tagline: { textAlign: 'center', marginBottom: 32 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabBtn: { flex: 1 },
  input: { marginBottom: 12 },
  primaryBtn: { marginTop: 8 },
  primaryBtnContent: { height: 48 },
  divider: { marginVertical: 20 },
  googleBtn: {},
});

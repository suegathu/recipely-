import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '../auth/firebase';
import { supabase } from '../auth/supabase';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

async function onUserLogin(user: User) {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('uid')
    .eq('uid', user.uid)
    .single();

  if (!existing) {
    await supabase.from('user_profiles').insert({
      uid: user.uid,
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoURL,
      role: 'customer',
    });
  }

  await useCartStore.getState().syncFromSupabase(user.uid);
}

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserLogin(user).catch(console.error);
    }
    set({ user, isLoading: false });
  });

  return {
    user: null,
    isLoading: true,
    signOut: async () => {
      const user = useAuthStore.getState().user;
      if (user) {
        await useCartStore.getState().syncToSupabase(user.uid).catch(console.error);
      }
      await signOut(auth);
    },
  };
});

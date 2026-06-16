import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '../auth/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, (user) => {
    set({ user, isLoading: false });
  });

  return {
    user: null,
    isLoading: true,
    signOut: () => signOut(auth),
  };
});

import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

// Mirrors data/network/NetworkMonitor.kt — exposed as PlitsoViewModel.isNetworkAvailable
interface NetworkState {
  isConnected: boolean;
}

export const useNetworkStore = create<NetworkState>(() => ({
  isConnected: true,
}));

NetInfo.addEventListener((state) => {
  useNetworkStore.setState({
    isConnected: Boolean(state.isConnected && state.isInternetReachable !== false),
  });
});

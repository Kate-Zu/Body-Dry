import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isChecking: boolean;
  
  // Actions
  initialize: () => () => void;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: null,
  isInternetReachable: null,
  connectionType: null,
  isChecking: false,

  initialize: () => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Initial fetch
    NetInfo.fetch().then((state: NetInfoState) => {
      set({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Return unsubscribe function for cleanup
    return unsubscribe;
  },

  checkConnection: async () => {
    set({ isChecking: true });
    try {
      const state = await NetInfo.fetch();
      set({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
        isChecking: false,
      });
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      set({ isChecking: false });
      return false;
    }
  },
}));

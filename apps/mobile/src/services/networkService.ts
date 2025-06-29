// import NetInfo from '@react-native-community/netinfo';
// import { useState, useEffect } from 'react';

// interface NetworkState {
//   isConnected: boolean | null;
//   isInternetReachable: boolean | null;
//   type: string | null;
// }

// class NetworkService {
//   private listeners: ((state: NetworkState) => void)[] = [];
//   private currentState: NetworkState = {
//     isConnected: null,
//     isInternetReachable: null,
//     type: null,
//   };

//   constructor() {
//     this.initialize();
//   }

//   private initialize() {
//     NetInfo.addEventListener(state => {
//       const networkState: NetworkState = {
//         isConnected: state.isConnected,
//         isInternetReachable: state.isInternetReachable,
//         type: state.type,
//       };

//       this.currentState = networkState;
//       this.notifyListeners(networkState);
//     });
//   }

//   private notifyListeners(state: NetworkState) {
//     this.listeners.forEach(listener => listener(state));
//   }

//   public subscribe(listener: (state: NetworkState) => void) {
//     this.listeners.push(listener);

//     // Return unsubscribe function
//     return () => {
//       this.listeners = this.listeners.filter(l => l !== listener);
//     };
//   }

//   public async checkConnection(): Promise<NetworkState> {
//     const state = await NetInfo.fetch();
//     return {
//       isConnected: state.isConnected,
//       isInternetReachable: state.isInternetReachable,
//       type: state.type,
//     };
//   }

//   public getCurrentState(): NetworkState {
//     return this.currentState;
//   }

//   public isOnline(): boolean {
//     return (
//       this.currentState.isConnected === true &&
//       this.currentState.isInternetReachable === true
//     );
//   }
// }

// // export const networkService = new NetworkService();

// // Custom hook for using network state in components
// // export const useNetworkState = () => {
// //   const [networkState, setNetworkState] = useState<NetworkState>(() =>
// //     networkService.getCurrentState()
// //   );

// //   useEffect(() => {
// //     const unsubscribe = networkService.subscribe(setNetworkState);
// //     return unsubscribe;
// //   }, []);

// //   return {
// //     ...networkState,
// //     isOnline:
// //       networkState.isConnected === true &&
// //       networkState.isInternetReachable === true,
// //   };
// // };

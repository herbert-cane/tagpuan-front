import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC1mP-dUYmKXRhDHI8V2oNnjsx8bas3BCk',
  authDomain: 'notional-buffer-462011-q7.firebaseapp.com',
  projectId: 'notional-buffer-462011-q7',
  storageBucket: 'notional-buffer-462011-q7.firebasestorage.app',
  messagingSenderId: '49506562506',
  appId: '1:49506562506:android:7ac02a0620086184615f33',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

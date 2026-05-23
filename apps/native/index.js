import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'expo-keep-awake';
import './global.css';

// 1. Register background handlers BEFORE anything else!
// This is critical for waking up the app when it is completely killed.
import './lib/notifications/background-notification-task';
import './lib/notifications/notifee-chat-events';

// 2. Start Expo Router
import 'expo-router/entry';

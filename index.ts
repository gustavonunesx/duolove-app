// Suppress expo-notifications Expo Go warning — push is intentionally disabled in Expo Go (SDK 53+)
const _error = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('expo-notifications')) return;
  _error(...args);
};

import 'expo-router/entry';

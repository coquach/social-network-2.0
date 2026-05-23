// Re-export from shared so native code that imports '~/store/call-store'
// continues to work while web can import directly from '@repo/shared'.
export { useCallStore, type CallStoreState } from '@repo/shared';

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  // Points at the local Auth emulator (started by `pnpm dev`) by default — no real Firebase
  // project is required. projectId must match the backend's FIREBASE_PROJECT_ID. Swap these for
  // a real project's config and set useAuthEmulator to false to test against real Firebase.
  firebaseConfig: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-scaffold.firebaseapp.com',
    projectId: 'demo-scaffold',
    appId: 'demo-app-id',
  },
  useAuthEmulator: true,
  authEmulatorHost: 'http://127.0.0.1:9099',
};

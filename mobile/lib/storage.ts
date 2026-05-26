import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'sp_access_token',
  refreshToken: 'sp_refresh_token',
  pushToken: 'sp_push_token',
  member: 'sp_member',
  sportPrefs: 'sp_sport_prefs',
} as const;

export const storage = {
  async setAccessToken(token: string) {
    await SecureStore.setItemAsync(KEYS.accessToken, token);
  },
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.accessToken);
  },
  async setRefreshToken(token: string) {
    await SecureStore.setItemAsync(KEYS.refreshToken, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },
  async setPushToken(token: string) {
    await SecureStore.setItemAsync(KEYS.pushToken, token);
  },
  async getPushToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.pushToken);
  },
  async setMember(member: object) {
    await SecureStore.setItemAsync(KEYS.member, JSON.stringify(member));
  },
  async getMember<T>(): Promise<T | null> {
    const data = await SecureStore.getItemAsync(KEYS.member);
    return data ? JSON.parse(data) : null;
  },
  async setSportPrefs(sports: string[]) {
    await SecureStore.setItemAsync(KEYS.sportPrefs, JSON.stringify(sports));
  },
  async getSportPrefs(): Promise<string[] | null> {
    const data = await SecureStore.getItemAsync(KEYS.sportPrefs);
    return data ? JSON.parse(data) : null;
  },
  async clearAll() {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.deleteItemAsync(KEYS.pushToken),
      SecureStore.deleteItemAsync(KEYS.member),
    ]);
  },
};

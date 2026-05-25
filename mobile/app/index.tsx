import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/lib/store';
import { Colors } from '@/constants/theme';
import type { Member } from '@/constants/types';

function isTokenValid(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const padded = payload + '=='.slice((payload.length % 4) || 4);
    const claims = JSON.parse(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    // Valid if not expired (with 60s buffer)
    return claims.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

export default function Index() {
  const router = useRouter();
  const { setMember, setLoading } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await storage.getAccessToken();
        if (token && isTokenValid(token)) {
          const member = await storage.getMember<Member>();
          if (member) {
            setMember(member);
            router.replace('/(tabs)');
            return;
          }
        }
        // No valid token or no cached profile — go to sign in
        router.replace('/(auth)');
      } catch {
        await storage.clearAll();
        router.replace('/(auth)');
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  );
}

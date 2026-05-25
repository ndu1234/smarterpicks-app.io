import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Colors } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { setMember, setLoading } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await storage.getAccessToken();
        if (token) {
          const me = await api.auth.me();
          setMember(me);
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)');
        }
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

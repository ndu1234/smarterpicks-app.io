import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Colors } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setMember, setLoading } = useAuthStore();
  const [ready, setReady] = useState(false);

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
        setReady(true);
      }
    }
    bootstrap();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  );
}

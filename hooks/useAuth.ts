import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const { member, isLoading, setMember, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const token = await storage.getAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const me = await api.auth.me();
        setMember(me);
      } catch {
        await storage.clearAll();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function signOut() {
    await storage.clearAll();
    setMember(null);
    router.replace('/(auth)');
  }

  return { member, isLoading, signOut };
}

import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const { member, isLoading, setMember, setLoading } = useAuthStore();
  const router = useRouter();

  // Auth is bootstrapped at the root _layout.tsx level.
  // This hook only exposes state + signOut.

  async function signOut() {
    await storage.clearAll();
    setMember(null);
    router.replace('/(auth)');
  }

  return { member, isLoading, signOut };
}

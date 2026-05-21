import { create } from 'zustand';
import type { Member } from '@/constants/types';

interface AuthState {
  member: Member | null;
  isLoading: boolean;
  setMember: (member: Member | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  isLoading: true,
  setMember: (member) => set({ member }),
  setLoading: (isLoading) => set({ isLoading }),
}));

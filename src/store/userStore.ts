import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'student' | 'instructor';
  enrolledCourses: string[];
  createdCourses?: string[];
}

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      updateProfile: (data) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...data }
            : null,
        })),
    }),
    {
      name: 'user-storage',
    }
  )
);
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, profileAPI } from '../utils/api';

interface UserContextType {
  user: UserProfile | null;
  userId: string;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState(() => {
    const stored = localStorage.getItem('bigguy_user_id');
    if (stored) return stored;
    const newId = `user_${Date.now()}`;
    localStorage.setItem('bigguy_user_id', newId);
    return newId;
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileAPI.get(userId);
        setUser(profile);
      } catch (error) {
        console.log('No profile found, onboarding required');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const hasCompletedOnboarding = Boolean(user && user.career);

  return (
    <UserContext.Provider value={{ user, userId, setUser, isLoading, hasCompletedOnboarding }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

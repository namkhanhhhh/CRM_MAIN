import { createContext, useContext, ReactNode } from 'react';
import { BDUser } from '@/types/customer';
import { bdUsers } from '@/data/mockData';

interface AuthContextType {
  currentUser: BDUser;
  isAdmin: boolean;
}

// Simulated current user - in real app this would come from authentication
const AuthContext = createContext<AuthContextType>({
  currentUser: bdUsers[0], // Default to first BD user
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simulate current logged-in user (first BD user)
  const currentUser = bdUsers[0];
  const isAdmin = false; // Simulate non-admin user for demo

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

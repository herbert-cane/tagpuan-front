import { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    try {
      // Simulate an authentication request
      console.log(`Logging in with ${email}`);
      setUser({ email });
    } catch (error) {
      console.error((error as Error).message); // Fix for 'error' being 'unknown'
    }
  };

  return (
    <AuthContext.Provider value={{ login }}>
      {children}
    </AuthContext.Provider>
  );
};

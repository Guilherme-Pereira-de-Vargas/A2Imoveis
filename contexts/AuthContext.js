import React, { createContext, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const signIn = (u) => {
    setUser(u);
    setIsGuest(false);
  };

  const signOut = () => {
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, isGuest, signIn, signOut, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

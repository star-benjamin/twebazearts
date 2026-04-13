import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import client from '../api/client';  // your axios instance
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Fetch profile (role, status, etc.)
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);
          // Store token for axios requests to Express
          localStorage.setItem('token', session.access_token);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('token');
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);
 
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };
 
  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } }
    });
    if (error) throw error;
    return data;
  };
 
  const logout = async () => {
    await supabase.auth.signOut();
  };
 
  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export const useAuth = () => useContext(AuthContext);
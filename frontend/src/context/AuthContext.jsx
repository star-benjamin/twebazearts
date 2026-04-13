import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    return data;
  };
 
  useEffect(() => {
    // Restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
        localStorage.setItem('token', session.access_token);
      } else {
        setLoading(false);
      }
    });
 
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
          localStorage.setItem('token', session.access_token);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('token');
        }
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
      email,
      password,
      options: { data: { name, role: 'ARTIST' } },
    });
    if (error) throw error;
    return data;
  };
 
  const logout = async () => {
    await supabase.auth.signOut();
  };
 
  const isAdmin  = profile?.role === 'ADMIN';
  const isArtist = profile?.role === 'ARTIST';
  const isApproved = profile?.status === 'APPROVED';
 
  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, loading, isAdmin, isArtist, isApproved }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export const useAuth = () => useContext(AuthContext);
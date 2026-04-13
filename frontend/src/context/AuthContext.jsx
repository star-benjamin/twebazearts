import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }
    console.log('Profile loaded:', data); // remove after debugging
    setProfile(data);
    return data;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('token', session.access_token);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event); // remove after debugging
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('token', session.access_token);
          await fetchProfile(session.user.id);
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
      email,
      password,
      options: { data: { name, role: 'ARTIST' } },
    });
    if (error) throw error;
    return data;
  };

  // Fixed logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('token');
    window.location.href = '/'; // force full page reload to clear state
  };

  const isAdmin    = profile?.role === 'ADMIN';
  const isArtist   = profile?.role === 'ARTIST';
  const isApproved = profile?.status === 'APPROVED';

  return (
    <AuthContext.Provider value={{
      user, profile, login, register, logout,
      loading, isAdmin, isArtist, isApproved
    }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <span className="font-serif text-3xl text-mist animate-pulse">Loading…</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
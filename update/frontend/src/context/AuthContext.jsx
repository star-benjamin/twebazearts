import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// BR-ADM-001: admin tokens must expire after 30 min of inactivity.
const IDLE_LIMIT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef(null);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }
    setProfile(data);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    supabase.auth.signOut().catch(console.error);
    window.location.replace('/login');
  };

  // Idle-timeout watcher — only runs while an admin session is active.
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(logout, IDLE_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(idleTimer.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('token', session.access_token);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // NOTE: `register` has intentionally been removed. BR-GEN-001 forbids
  // creating additional administrative accounts from inside the app. If you
  // still have old code importing `register` from this context, remove it —
  // the single admin account is provisioned once, directly in Supabase.

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, loading, isAdmin }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <span className="font-serif text-3xl text-mist animate-pulse">Loading…</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

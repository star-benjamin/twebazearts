import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-smoke px-4 md:px-6">
      <div className="w-full max-w-sm bg-white p-8 md:p-10 shadow-sm md:shadow-none">
        <h1 className="font-serif text-3xl font-light mb-1">Admin Sign In</h1>
        <p className="text-[11px] md:text-xs text-stone tracking-wide mb-8">
          Restricted to the studio administrator account
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-[11px] p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            ['email', 'Email', 'email'],
            ['password', 'Password', 'password']
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-[10px] md:text-[11px] tracking-widest uppercase text-stone mb-2">
                {label}
              </label>
              <input
                type={type}
                required
                className="w-full border border-ash px-4 py-3 text-base md:text-sm focus:outline-none focus:border-ink transition-colors rounded-none appearance-none"
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-4 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* No "create an account" link — BR-GEN-001 forbids self-registration.
            There is exactly one admin account, provisioned manually in Supabase. */}
      </div>
    </div>
  );
}

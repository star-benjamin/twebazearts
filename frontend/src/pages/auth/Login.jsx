import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
 
export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-smoke px-4">
      <div className="w-full max-w-sm bg-white p-10">
        <h1 className="font-serif text-3xl font-light mb-1">Welcome back</h1>
        <p className="text-xs text-stone tracking-wide mb-8">Sign in to your TWEBAZEarts account</p>
 
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 mb-6">{error}</div>}
 
        <form onSubmit={handleSubmit} className="space-y-5">
          {[['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-[11px] tracking-widest uppercase text-stone mb-2">{label}</label>
              <input
                type={type}
                required
                className="w-full border border-ash px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
 
        <p className="text-xs text-stone text-center mt-6">
          No account?{' '}
          <Link to="/register" className="text-ink border-b border-mist hover:border-ink">Join as an artist</Link>
        </p>
      </div>
    </div>
  );
}
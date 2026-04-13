import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
 
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
 
  if (success) return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-smoke px-4">
      <div className="w-full max-w-sm bg-white p-10 text-center">
        <div className="text-3xl mb-4">✉️</div>
        <h2 className="font-serif text-2xl font-light mb-3">Check your email</h2>
        <p className="text-sm text-stone leading-relaxed mb-6">
          We've sent a confirmation link to <strong>{form.email}</strong>.
          Once confirmed, an admin will review and approve your artist account.
        </p>
        <Link to="/" className="text-xs tracking-widest uppercase text-stone hover:text-ink border-b border-mist">
          Return to Gallery
        </Link>
      </div>
    </div>
  );
 
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-smoke px-4">
      <div className="w-full max-w-sm bg-white p-10">
        <h1 className="font-serif text-3xl font-light mb-1">Join TWEBAZEarts</h1>
        <p className="text-xs text-stone tracking-wide mb-8">Apply to showcase your work</p>
 
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 mb-6">{error}</div>}
 
        <form onSubmit={handleSubmit} className="space-y-5">
          {[['name','Full Name','text'],['email','Email','email'],['password','Password','password']].map(([key, label, type]) => (
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
          <p className="text-[11px] text-stone leading-relaxed">
            After registration, your account will be reviewed by our team before going live.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Apply Now'}
          </button>
        </form>
 
        <p className="text-xs text-stone text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ink border-b border-mist hover:border-ink">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
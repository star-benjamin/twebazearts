const { supabase, supabaseAdmin } = require('../config/supabase');

// NOTE: `register` has been removed entirely. BR-GEN-001 forbids any
// interface that creates additional administrative accounts. The single
// admin user must be created once, directly in the Supabase dashboard
// (Authentication > Users > Add User), with a matching row inserted into
// `profiles` with role = 'ADMIN'.

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('*').eq('id', data.user.id).single();

  if (!profile || profile.role !== 'ADMIN')
    return res.status(403).json({ error: 'This account is not authorized to access the admin dashboard' });

  res.json({ token: data.session.access_token, user: data.user, profile });
};

// LOGOUT
exports.logout = async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
};

// ME
exports.me = async (req, res) => {
  res.json({ user: req.user, profile: req.profile });
};

// UPDATE PROFILE (admin's own display name only — no bio/whatsapp/etc,
// those belonged to the old artist-account model)
exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ name })
    .eq('id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

const { supabase, supabaseAdmin } = require('../config/supabase');
 
// REGISTER
// Supabase Auth handles password hashing. We pass name + role
// in raw_user_meta_data so the DB trigger can set them on profiles.
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'ARTIST' } }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({
    token: data.session?.access_token,
    user:  data.user,
    message: 'Registration successful. Await admin approval.'
  });
};
 
// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
 
  // Check status
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('status, role').eq('id', data.user.id).single();
 
  if (profile?.status === 'BANNED')
    return res.status(403).json({ error: 'Account banned' });
 
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
 
// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const { name, bio, whatsapp_number, instagram_handle, location } = req.body;
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ name, bio, whatsapp_number, instagram_handle, location })
    .eq('id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
const { supabaseAdmin } = require('../config/supabase');

// Verifies the bearer token against Supabase Auth and attaches the caller's
// profile to the request. Since BR-GEN-001 restricts this system to exactly
// one administrator account, there is no role branching here anymore — if
// you have a valid session, you are the admin. requireRole.js has been
// removed; delete it from your routes imports.
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(401).json({ error: 'Profile not found' });

  req.user    = user;
  req.profile = profile;
  next();
};

const { supabaseAdmin } = require('../config/supabase');
 
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
 
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
 
  // Fetch their profile for role/status
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
 
  if (!profile) return res.status(401).json({ error: 'Profile not found' });
  if (profile.status === 'BANNED') return res.status(403).json({ error: 'Account banned' });
 
  req.user    = user;
  req.profile = profile;
  next();
};
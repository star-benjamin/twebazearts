const { supabaseAdmin } = require('../config/supabase');

// Used on public endpoints that behave slightly differently for the logged-in
// admin (e.g. artwork listing shows unpublished items with ?admin=1). Unlike
// auth.js, this NEVER returns 401 — it just leaves req.profile undefined if
// there's no token or it's invalid.
module.exports = async (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return next();

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('*').eq('id', user.id).single();

  if (profile) {
    req.user = user;
    req.profile = profile;
  }
  next();
};

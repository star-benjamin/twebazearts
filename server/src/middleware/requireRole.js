module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.profile.role))
    return res.status(403).json({ error: 'Forbidden' });
  next();
};
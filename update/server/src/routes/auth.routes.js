const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/auth.controller');

// No /register route — see BR-GEN-001. The single admin account is
// provisioned manually in Supabase, not through the app.
router.post('/login',    ctrl.login);
router.post('/logout',   ctrl.logout);
router.get('/me',        auth, ctrl.me);
router.patch('/profile', auth, ctrl.updateProfile);

module.exports = router;

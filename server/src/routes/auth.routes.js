const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/auth.controller');
 
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.post('/logout',   ctrl.logout);
router.get('/me',        auth, ctrl.me);
router.patch('/profile', auth, ctrl.updateProfile);
 
module.exports = router;
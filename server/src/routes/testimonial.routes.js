const router       = require('express').Router();
const ctrl         = require('../controllers/testimonial.controller');
const auth         = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/', optionalAuth, ctrl.list);

router.post('/',      auth, ctrl.create);
router.patch('/:id',  auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;

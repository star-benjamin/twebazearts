const router = require('express').Router();
const ctrl   = require('../controllers/payment.controller');
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/',      ctrl.create);
router.get('/',       ctrl.list);
router.delete('/:id', ctrl.remove);

module.exports = router;

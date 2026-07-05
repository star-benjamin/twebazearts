const router = require('express').Router();
const ctrl   = require('../controllers/commission.controller');
const auth   = require('../middleware/auth');

router.post('/', ctrl.create); // public — commission request form

router.post('/from-inquiry', auth, ctrl.createFromInquiry);
router.get('/',              auth, ctrl.list);
router.get('/:id',           auth, ctrl.detail);
router.patch('/:id',         auth, ctrl.update);

module.exports = router;

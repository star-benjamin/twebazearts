const router = require('express').Router();
const ctrl   = require('../controllers/inquiry.controller');
const auth   = require('../middleware/auth');

router.post('/', ctrl.create); // public — the structured inquiry form

router.get('/',              auth, ctrl.list);
router.get('/:id',           auth, ctrl.detail);
router.patch('/:id',         auth, ctrl.update);
router.post('/:id/quote',    auth, ctrl.generateQuote);

module.exports = router;

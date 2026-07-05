const router = require('express').Router();
const ctrl   = require('../controllers/project.controller');
const auth   = require('../middleware/auth');

router.use(auth); // projects are internal-only; no public visibility in the SRS

router.post('/',      ctrl.create);
router.get('/',       ctrl.list);
router.get('/:id',    ctrl.detail);
router.patch('/:id',  ctrl.update);

module.exports = router;

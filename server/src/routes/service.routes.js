

const router      = require('express').Router();
const ctrl        = require('../controllers/service.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/',       ctrl.list);                                        // public — anyone can view services
router.get('/:id',    ctrl.detail);                                      // public — single service detail
router.post('/',      auth, requireRole('ARTIST'), ctrl.create);         // ARTIST only
router.patch('/:id',  auth, ctrl.update);                                // owner or ADMIN (checked in controller)
router.delete('/:id', auth, ctrl.remove);                                // owner or ADMIN (checked in controller)

module.exports = router;
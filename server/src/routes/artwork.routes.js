const router      = require('express').Router();
const ctrl        = require('../controllers/artwork.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
 
router.get('/',       ctrl.list);                           // public
router.get('/:id',    ctrl.detail);                         // public
router.post('/',      auth, requireRole('ARTIST'), ctrl.create);
router.patch('/:id',  auth, ctrl.update);                   // owner or admin
router.delete('/:id', auth, ctrl.remove);                   // owner or admin
 
module.exports = router;
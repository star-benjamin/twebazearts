const router      = require('express').Router();
const ctrl        = require('../controllers/admin.controller');
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
 
router.use(auth, requireRole('ADMIN'));
 
router.get('/artists',               ctrl.listArtists);
router.patch('/artists/:id/approve', ctrl.approveArtist);
router.patch('/artists/:id/ban',     ctrl.banArtist);
router.delete('/artists/:id',        ctrl.deleteArtist);
router.delete('/artworks/:id',       ctrl.deleteArtwork);
router.get('/stats',                 ctrl.stats);
 
module.exports = router;
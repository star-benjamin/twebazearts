const router        = require('express').Router();
const ctrl          = require('../controllers/artwork.controller');
const auth          = require('../middleware/auth');
const optionalAuth  = require('../middleware/optionalAuth');

// Public reads (optionalAuth lets the admin dashboard pass a token to see
// unpublished/all artworks via ?admin=1, everyone else only ever sees
// visibility = PUBLISHED — see BR-GEN-003)
router.get('/categories', ctrl.listCategories);
router.get('/',           optionalAuth, ctrl.list);
router.get('/:id',        optionalAuth, ctrl.detail);

// Admin-only writes — no ARTIST role exists anymore, so every write route
// just requires a valid admin session (FR-ART-001 through FR-ART-007)
router.post('/',                    auth, ctrl.create);
router.patch('/:id',                auth, ctrl.update);
router.delete('/:id',               auth, ctrl.remove);
router.post('/:id/images',          auth, ctrl.addImage);
router.delete('/:id/images/:imageId', auth, ctrl.removeImage);

router.post('/categories',          auth, ctrl.createCategory);
router.delete('/categories/:id',    auth, ctrl.deleteCategory);

module.exports = router;

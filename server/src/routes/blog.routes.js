const router       = require('express').Router();
const ctrl         = require('../controllers/blog.controller');
const auth         = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/',            optionalAuth, ctrl.list);
router.get('/slug/:slug',  ctrl.detailBySlug);

router.post('/',              auth, ctrl.create);
router.patch('/:id',          auth, ctrl.update);
router.delete('/:id',         auth, ctrl.remove);
router.get('/:id/export-pdf', auth, ctrl.exportPdf);

module.exports = router;

const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const auth   = require('../middleware/auth');

router.use(auth);

// Old endpoints removed: listArtists / approveArtist / banArtist / deleteArtist
// (artist accounts no longer exist — see server/src/routes/artist.routes.js
// for the new reference-table CRUD) and deleteArtwork (now on artwork.routes.js).
router.get('/dashboard', ctrl.dashboard);

module.exports = router;

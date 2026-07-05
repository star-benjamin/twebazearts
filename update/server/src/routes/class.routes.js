const router = require('express').Router();
const ctrl   = require('../controllers/class.controller');
const auth   = require('../middleware/auth');

router.get('/',      ctrl.list);   // public schedule
router.get('/:id',   ctrl.detail); // public detail
router.post('/:id/bookings', ctrl.book); // public booking request

router.post('/',        auth, ctrl.create);
router.patch('/:id',    auth, ctrl.update);
router.delete('/:id',   auth, ctrl.remove);
router.get('/:id/roster',                    auth, ctrl.roster);
router.patch('/:id/bookings/:bookingId',     auth, ctrl.markAttendance);

module.exports = router;

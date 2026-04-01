const router = require('express').Router();
const auth = require('../middleware/auth');

// ✅ import full controller (NO destructuring)
const studentController = require('../controllers/student.controller');

/* ================= PROFILE ================= */

router.post(
  '/profile',
  auth,
  studentController.upload.single('document'),
  studentController.updateProfile
);

router.get('/profile', auth, studentController.getProfile);

/* ================= PREFERENCES ================= */

router.post('/preferences', auth, studentController.submitPreferences);
router.put('/preferences', auth, studentController.submitPreferences);

/* ================= ALLOTMENT ================= */

router.get('/allotment', auth, studentController.getAllotment);
router.post('/allotment/hold', auth, studentController.holdRoom);
router.post('/allotment/upgrade', auth, studentController.upgradeRoom);
router.post('/allotment/confirm', auth, studentController.confirmAllotment);

/* ================= ROOMS ================= */

router.get('/rooms', auth, studentController.getAllRoomsForPreferences);
router.get('/rooms/available', auth, studentController.getAvailableRooms);

/* ================= SWAP ================= */

router.post('/swap/request', auth, studentController.requestSwap);
router.put('/swap/:id/respond', auth, studentController.respondSwap);
router.get('/swap/requests', auth, studentController.getSwapRequests);

module.exports = router;
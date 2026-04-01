const router  = require('express').Router();
const auth    = require('../middleware/auth');
const {
  upload,
  updateProfile,
  getProfile,
  submitPreferences,
  getAllotment,
  getAvailableRooms,
  holdRoom,
  upgradeRoom,
  requestSwap,
  respondSwap,
  getAllRoomsForPreferences,
  getSwapRequests,
  confirmAllotment,
} = require('../controllers/student.controller');

router.post('/profile',           auth, upload.single('document'), updateProfile);
router.get('/profile',            auth, getProfile);
router.post('/preferences',       auth, submitPreferences);
router.put('/preferences',        auth, submitPreferences);
router.get('/allotment',          auth, getAllotment);
router.get('/rooms/available',    auth, getAvailableRooms);
router.post('/allotment/hold',    auth, holdRoom);
router.post('/allotment/upgrade', auth, upgradeRoom);
router.post('/swap/request',      auth, requestSwap);
router.put('/swap/:id/respond',   auth, respondSwap);
router.get('/rooms', auth, getAllRoomsForPreferences);
router.get('/swap/requests', auth, getSwapRequests);
router.post('/allotment/confirm', auth, confirmAllotment);

module.exports = router;
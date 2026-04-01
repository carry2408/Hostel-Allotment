const router   = require('express').Router();
const auth     = require('../middleware/auth');
const isAdmin  = require('../middleware/isAdmin');
const {
  addRoom,
  getAllRooms,
  deleteRoom,
  getAllStudents,
  getAllAllotments,
  openApplications,
  closeApplications,
  openRound2,
  closeRound2,
  overrideAllotment,
  startNewYear,   
  endFullAllotment,
  exportAndReset,
} = require('../controllers/admin.controller');

router.post('/rooms',              auth, isAdmin, addRoom);
router.get('/rooms',               auth, isAdmin, getAllRooms);
router.delete('/rooms/:id',        auth, isAdmin, deleteRoom);
router.get('/students',            auth, isAdmin, getAllStudents);
router.get('/allotments',          auth, isAdmin, getAllAllotments);
router.post('/applications/open',  auth, isAdmin, openApplications);
router.post('/applications/close', auth, isAdmin, closeApplications);
router.post('/round2/open',        auth, isAdmin, openRound2);
router.post('/round2/close',       auth, isAdmin, closeRound2);
router.put('/allotments/:id',      auth, isAdmin, overrideAllotment);
router.post('/year/start', auth, isAdmin, startNewYear);
router.post('/allotment/end', auth, isAdmin, endFullAllotment);
router.post('/export-reset', auth, isAdmin, exportAndReset);
module.exports = router;

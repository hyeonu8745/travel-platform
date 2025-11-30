const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware'); // ⭐️ 중괄호 빼고, 이름 변경
const asyncHandler = require('../middlewares/async.handler');

// 1. 여행 저장
// ⭐️ upload.single('image') 대신 uploadMiddleware를 바로 사용
router.post('/', authenticateToken, uploadMiddleware, asyncHandler(tripController.createTrip));

// ... (나머지 코드는 동일) ...
router.get('/', asyncHandler(tripController.getAllTrips));
router.get('/my', authenticateToken, asyncHandler(tripController.getMyTrips));
router.get('/:tripId', asyncHandler(tripController.getTripDetails));
router.delete('/:tripId', authenticateToken, asyncHandler(tripController.deleteTrip));

module.exports = router;

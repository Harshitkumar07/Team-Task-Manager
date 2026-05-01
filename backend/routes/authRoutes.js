const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

router.post('/signup', validateRequest(schemas.signup), registerUser);
router.post('/login', validateRequest(schemas.login), loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;

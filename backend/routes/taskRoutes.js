const express = require('express');
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  getAllTasks,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

router.get('/dashboard', protect, getDashboardStats);

router.route('/')
  .get(protect, getAllTasks)
  .post(protect, authorize('admin'), validateRequest(schemas.task), createTask);

router.route('/:id')
  .put(protect, validateRequest(schemas.taskUpdate), updateTask)
  .delete(protect, authorize('admin'), deleteTask);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  updateProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

const { getTasks } = require('../controllers/taskController');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), validateRequest(schemas.project), createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin'), validateRequest(schemas.projectUpdate), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.route('/:projectId/tasks').get(protect, getTasks);

module.exports = router;

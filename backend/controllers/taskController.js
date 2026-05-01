const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Strict Access Control
    if (req.user.role !== 'admin' && !project.members.includes(req.user._id)) {
      res.status(403);
      throw new Error('Forbidden: You are not a member of this project');
    }

    // Pagination & Filtering
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { projectId: req.params.projectId };
    
    // Status Filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({ 
      success: true, 
      count: tasks.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: tasks 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      dueDate,
      status: status || 'todo'
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Strict Ownership Enforcement
    if (req.user.role === 'member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
         res.status(403);
         throw new Error('Forbidden: You can only update tasks explicitly assigned to you');
      }
      
      const { status } = req.body;
      if (!status) {
         res.status(400);
         throw new Error('Members can only update task status');
      }

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('assignedTo', 'name email');
      
      return res.status(200).json({ success: true, data: updatedTask });
    }

    // Admin full update
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email');

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let matchStage = {};

    if (req.user.role === 'admin') {
      matchStage = {}; 
    } else {
      // Find all projects where the user is a member
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      // Members see all tasks in projects they belong to
      matchStage = { projectId: { $in: projectIds } };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $in: ['$status', ['todo', 'in-progress']] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: [{ $type: '$dueDate' }, 'missing'] },
                    { $lt: ['$dueDate', today] },
                    { $ne: ['$status', 'done'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 };
    delete result._id;

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks globally
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      // Find all projects where the user is a member
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      query.projectId = { $in: projectIds };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  getAllTasks,
};

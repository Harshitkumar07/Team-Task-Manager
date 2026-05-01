const Project = require('../models/Project');

// @desc    Get all projects (filtered by user)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      // Admin sees projects they created (or all? The prompt said "Admin -> Full access to all projects")
      // Let's give Admin access to ALL projects to align with "Admin -> Full access to all projects and tasks"
      projects = await Project.find({}).populate('members', 'name email role');
    } else {
      // Member sees ONLY projects where they exist in members array
      projects = await Project.find({ members: req.user._id }).populate('createdBy', 'name email');
    }
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role');
    
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Strict Access Control: Admin can access any, Member ONLY if in members array
    if (req.user.role !== 'admin' && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Forbidden: You are not a member of this project');
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await project.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (add/remove members)
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('members', 'name email role');

    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  updateProject,
};

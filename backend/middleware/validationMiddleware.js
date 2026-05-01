const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      res.status(400);
      return next(new Error(errorMessage));
    }
    next();
  };
};

const schemas = {
  signup: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).max(30).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    }),
    role: Joi.string().valid('admin', 'member').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  project: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId')).optional()
  }),

  projectUpdate: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId')).optional()
  }),

  task: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    projectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId').required(),
    assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId').optional().allow(null),
    status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
    dueDate: Joi.date().iso().optional()
  }),

  taskUpdate: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    projectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId').optional(),
    assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId').optional().allow(null),
    status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
    dueDate: Joi.date().iso().optional()
  })
};

module.exports = { validateRequest, schemas };

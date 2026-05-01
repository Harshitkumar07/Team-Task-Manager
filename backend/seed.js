const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create Member
    const memberUser = await User.create({
      name: 'Team Member',
      email: 'member@example.com',
      password: hashedPassword,
      role: 'member'
    });

    // Create Project
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Overhaul the corporate website with new branding and improved UX.',
      createdBy: adminUser._id,
      members: [adminUser._id, memberUser._id]
    });

    // Create Tasks
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 5);
    
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 2);

    await Task.insertMany([
      {
        title: 'Design Mockups',
        description: 'Create Figma mockups for the homepage',
        projectId: project1._id,
        assignedTo: adminUser._id,
        status: 'done',
        dueDate: pastDate
      },
      {
        title: 'Frontend Implementation',
        description: 'Convert Figma designs to React components',
        projectId: project1._id,
        assignedTo: memberUser._id,
        status: 'in-progress',
        dueDate: futureDate
      },
      {
        title: 'Backend API Setup',
        description: 'Setup Node.js Express server and MongoDB models',
        projectId: project1._id,
        assignedTo: adminUser._id,
        status: 'todo',
        dueDate: futureDate
      },
      {
        title: 'Write Documentation',
        description: 'Update the README with setup instructions',
        projectId: project1._id,
        assignedTo: memberUser._id,
        status: 'todo',
        dueDate: pastDate // This will be overdue
      }
    ]);

    console.log('Data seeded successfully!');
    console.log('Admin Login: admin@example.com / password123');
    console.log('Member Login: member@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data', error);
    process.exit(1);
  }
};

seedData();

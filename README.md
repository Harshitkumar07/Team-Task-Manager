# Team Task Manager 

A full-stack, production-ready web application built to streamline project management and team collaboration. With a clean interface, robust role-based access control, and dynamic task tracking, Team Task Manager empowers teams to work together efficiently.

![Team Task Manager Demo](https://via.placeholder.com/1000x500.png?text=Team+Task+Manager)

## Key Features
- **Secure Authentication:** JWT-based user authentication (Signup/Login) with automatic session handling.
- **Strict Role-Based Access Control (RBAC):**
  - **Admins:** Full control to create projects, invite/remove members, and assign tasks.
  - **Members:** View their assigned tasks and update statuses safely.
- **Project & Team Management:** Easily build projects, add users to specific projects, and track overall progress.
- **Dynamic Task Tracking:** Create, assign, and track tasks (`To Do` → `In Progress` → `Done`).
- **Interactive Dashboard:** High-level metrics for Total, Completed, Pending, and Overdue tasks, complete with clickable navigation.
- **Optimistic UI:** Instant status and assignment updates without page reloads.

## Technology Stack
- **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons, Axios, React Router.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Security:** Helmet, Express Rate Limit, Morgan, Joi Validation, bcrypt.js.
- **Deployment:** Vercel (Frontend), Railway (Backend).

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Harshitkumar07/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

## Live Deployment Configuration
If you're deploying this to production, follow these key environment settings:

- **Backend (Railway):** 
  Add `MONGO_URI`, `JWT_SECRET`, and `PORT`. Railway will handle the origin requests safely.
- **Frontend (Vercel):**
  Add `VITE_API_URL` pointing directly to your live backend domain (e.g., `https://your-backend-url.railway.app/api`).

## License
MIT License

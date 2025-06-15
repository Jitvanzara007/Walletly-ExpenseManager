# Modern Expense Manager

A full-stack expense management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization with JWT
- Real-time expense tracking and categorization
- Interactive dashboard with expense analytics
- Responsive design for all devices
- RESTful API architecture
- Secure MongoDB database integration

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Material-UI for components
- Chart.js for analytics
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expense-manager.git
cd expense-manager
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# In backend directory
cp .env.example .env
# Edit .env with your configuration

# In frontend directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
mongod
```

5. Run the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure


## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Expenses
- GET /api/expenses - Get all expenses
- POST /api/expenses - Create new expense
- GET /api/expenses/:id - Get expense by ID
- PUT /api/expenses/:id - Update expense
- DELETE /api/expenses/:id - Delete expense

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


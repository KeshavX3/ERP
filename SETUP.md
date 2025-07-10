# ERP System Setup Guide

## Prerequisites

Before running the application, make sure you have the following installed:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - [Download here](https://git-scm.com/)

## Quick Start

### 1. Install Dependencies

In VS Code, open the terminal and run:

```bash
npm run install-all
```

This will install both backend and frontend dependencies.

### 2. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 3. Environment Setup

The `.env` file is already configured with default values:
- MongoDB URL: `mongodb://localhost:27017/erp-system`
- Server Port: `5000`
- JWT Secret: Pre-configured (change in production)

### 4. Seed Sample Data (Optional)

To add sample data including users, categories, brands, and products:

```bash
npm run seed
```

This creates:
- Admin user: `admin@erp.com` / `admin123`
- Regular user: `user@erp.com` / `user123`
- Sample categories, brands, and products

### 5. Start the Application

You have several options:

**Option A: Start both backend and frontend together (Recommended)**
```bash
npm run dev:full
```

**Option B: Start backend only**
```bash
npm run dev
```

**Option C: Start frontend only** (in a separate terminal)
```bash
npm run client
```

## Using VS Code Tasks

You can also use VS Code tasks to run the application:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select one of the available tasks:
   - Start Full Application
   - Start Backend Server
   - Start Frontend Client
   - Install All Dependencies
   - Build Application

## Accessing the Application

Once running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Default Login Credentials

After seeding data, you can log in with:

**Admin Account:**
- Email: `admin@erp.com`
- Password: `admin123`

**User Account:**
- Email: `user@erp.com`
- Password: `user123`

## Features Overview

### Authentication
- JWT-based authentication
- User registration and login
- Protected routes
- Role-based access (admin/user)

### Product Management
- Create, read, update, delete products
- Product categories and brands
- Image support
- Pricing and discounts
- Stock management
- Search and filtering

### User Interface
- Responsive design
- Modern Bootstrap-based UI
- Sidebar navigation
- Modal dialogs for forms
- Toast notifications
- Loading states

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (auth required)
- `PUT /api/categories/:id` - Update category (auth required)
- `DELETE /api/categories/:id` - Delete category (auth required)

#### Brands
- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create brand (auth required)
- `PUT /api/brands/:id` - Update brand (auth required)
- `DELETE /api/brands/:id` - Delete brand (auth required)

## Development

### Project Structure

```
ERP/
├── server/                 # Backend Node.js application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── index.js          # Server entry point
│   └── seedData.js       # Sample data script
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context
│   │   ├── services/     # API services
│   │   └── config/       # Configuration files
│   └── public/           # Static assets
├── .env                  # Environment variables
├── package.json          # Root package.json
└── README.md            # Documentation
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`, models in `server/models/`
2. **Frontend**: Add components in `client/src/components/`, pages in `client/src/pages/`
3. **API Services**: Add service functions in `client/src/services/`

### Testing API with Postman

Import the following endpoints for testing:
- Base URL: `http://localhost:5000/api`
- Add `Authorization: Bearer <token>` header for protected routes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill existing processes on ports 3000 or 5000

3. **Module Not Found Errors**
   - Run `npm run install-all` to install dependencies
   - Delete `node_modules` and reinstall if needed

4. **CORS Errors**
   - Backend is configured to allow requests from `http://localhost:3000`
   - Check proxy configuration in `client/package.json`

### Getting Help

- Check the browser console for frontend errors
- Check the terminal/server logs for backend errors
- Ensure all dependencies are installed
- Verify MongoDB is running and accessible

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Build the frontend: `npm run build`
3. Use a process manager like PM2 for the backend
4. Set up a reverse proxy with Nginx
5. Use a cloud MongoDB service like MongoDB Atlas
6. Configure proper security headers and HTTPS

## License

This project is licensed under the MIT License.

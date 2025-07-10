# ERP System

A full-stack web application built with React frontend and Node.js backend, featuring user authentication, sidebar navigation, and product management capabilities.

## Features

- **User Authentication**: JWT-based authentication with sign-in/sign-up
- **Sidebar Navigation**: Dynamic navigation with Products, Categories, Brands
- **Product Management**: CRUD operations for products with detailed views
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and user-friendly interface

## Technologies Used

### Frontend
- React.js
- Bootstrap (for styling)
- Axios (for API calls)
- React Router (for navigation)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (for password hashing)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ERP
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/erp-system
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Run both frontend and backend
   npm run dev:full
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Brands
- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create new brand

## Project Structure

```
ERP/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── public/
├── package.json
└── README.md
```

## Usage

1. **Sign Up/Sign In**: Create an account or log in with existing credentials
2. **Navigation**: Use the sidebar to navigate between Products, Categories, and Brands
3. **Product Management**: 
   - View all products in a list format
   - Click on a product to view detailed information
   - Edit or delete products using the action buttons
   - Add new products using the add button

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

# Hamro Sewa - Service Marketplace Platform

A comprehensive service marketplace platform connecting service providers with customers across Nepal. Built with Next.js, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [User Roles & Permissions](#user-roles--permissions)
- [System Flow](#system-flow)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Frontend Pages](#frontend-pages)
- [Admin Dashboard](#admin-dashboard)
- [Environment Variables](#environment-variables)

---

## 🎯 Overview

Hamro Sewa is a full-stack service marketplace platform that enables:
- **Customers** to find and book professional services
- **Service Providers** to offer their services and manage bookings
- **Admins** to manage the entire platform, services, users, and content

---

## ✨ Features

### For Customers (Clients)
- Browse 26+ service categories
- Search and filter services by location, category, and price
- Post job requirements
- Review service provider applications
- Real-time messaging with service providers
- Track job status and history

### For Service Providers (Workers)
- Create professional service listings
- Browse available jobs
- Apply to job postings
- Manage applications and bookings
- Real-time chat with clients
- Build reputation through ratings

### For Administrators
- Complete platform management dashboard
- User management (clients, workers, admins)
- Service and category management
- Job monitoring and moderation
- AMC (Annual Maintenance Contract) package management
- Dynamic content management (hero sections, site content)
- Analytics and statistics

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Material Symbols
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer (if implemented)

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Editor**: VS Code (recommended)

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │  TypeScript  │  │  Tailwind    │      │
│  │  Frontend    │  │   Components │  │     CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │   Socket.IO  │  │     JWT      │      │
│  │   REST API   │  │  Real-time   │  │     Auth     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MongoDB                            │   │
│  │  Collections: users, jobs, applications, services,   │   │
│  │  categories, messages, amcpackages, sitecontents     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
hamro-sewa/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js     # User authentication & management
│   │   ├── jobController.js      # Job posting & management
│   │   ├── applicationController.js
│   │   ├── messageController.js  # Real-time messaging
│   │   ├── serviceController.js  # Service listings
│   │   ├── categoryController.js # Category management
│   │   ├── amcPackageController.js
│   │   ├── siteContentController.js
│   │   └── servicesHeroController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── roleMiddleware.js     # Role-based access control
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Job.js                # Job posting schema
│   │   ├── Application.js        # Job application schema
│   │   ├── Message.js            # Chat message schema
│   │   ├── Service.js            # Service listing schema
│   │   ├── Category.js           # Category schema
│   │   ├── AMCPackage.js         # AMC package schema
│   │   ├── SiteContent.js        # Dynamic content schema
│   │   └── ServicesHero.js       # Hero section schema
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── amcPackageRoutes.js
│   │   ├── siteContentRoutes.js
│   │   └── servicesHeroRoutes.js
│   ├── public/                   # Static files
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server entry point
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── about/                # About page
    │   │   └── components/
    │   ├── amc-packages/         # AMC packages pages
    │   │   └── [id]/
    │   ├── category/             # Category pages
    │   │   └── [name]/
    │   ├── components/           # Shared components
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Hero.tsx
    │   │   ├── Category.tsx
    │   │   ├── FeaturedServices.tsx
    │   │   ├── PopularServices.tsx
    │   │   ├── AMCPackages.tsx
    │   │   ├── Testimonials.tsx
    │   │   ├── FAQ.tsx
    │   │   └── WhatsAppButton.tsx
    │   ├── contact/              # Contact page
    │   ├── dashboard/            # User dashboard
    │   │   └── components/
    │   │       ├── DashboardLayout.tsx
    │   │       ├── Sidebar.tsx
    │   │       ├── TopNavbar.tsx
    │   │       ├── Header.tsx
    │   │       └── sections/
    │   ├── hamrosewa/            # Admin dashboard
    │   │   └── sections/
    │   │       ├── DashboardSection.tsx
    │   │       ├── UsersSection.tsx
    │   │       ├── JobsSection.tsx
    │   │       ├── ServicesSection.tsx
    │   │       ├── ServiceCategoriesSection.tsx
    │   │       ├── AMCPackagesSection.tsx
    │   │       └── ServicesHeroSection.tsx
    │   ├── login/                # Login page
    │   ├── register/             # Registration page
    │   ├── service/              # Service detail pages
    │   │   └── [id]/
    │   ├── services/             # Services listing page
    │   ├── layout.tsx            # Root layout
    │   ├── page.tsx              # Homepage
    │   └── globals.css           # Global styles
    ├── lib/
    │   ├── api.ts                # API utilities
    │   └── utils.ts              # Helper functions
    ├── public/
    │   └── logo.png
    ├── .env.local                # Frontend environment variables
    ├── next.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hamro-sewa
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the server:
```bash
npm start
# or for development with nodemon
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 👥 User Roles & Permissions

### 1. Client (Customer)
**Capabilities:**
- Register and login
- Browse and search services
- Post job requirements
- Review worker applications
- Accept/reject applications
- Message with workers
- View job history

**Dashboard Access:** `/dashboard`

### 2. Worker (Service Provider)
**Capabilities:**
- Register and login
- Create service listings
- Browse available jobs
- Apply to jobs
- Message with clients
- Manage applications
- View application history

**Dashboard Access:** `/dashboard`

### 3. Admin
**Capabilities:**
- Full platform management
- User management (CRUD)
- Service management (CRUD)
- Category management (CRUD)
- Job monitoring
- AMC package management
- Content management
- Analytics and reports

**Dashboard Access:** `/hamrosewa`

---

## 🔄 System Flow

### 1. User Registration & Authentication Flow

```
User Registration
    ↓
Choose Role (Client/Worker)
    ↓
Fill Registration Form
    ↓
Submit to /api/users/register
    ↓
Backend validates data
    ↓
Hash password with bcrypt
    ↓
Save user to MongoDB
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store in localStorage
    ↓
Redirect to dashboard
```

### 2. Job Posting Flow (Client)

```
Client logs in
    ↓
Navigate to Dashboard
    ↓
Click "Post a Job"
    ↓
Fill job details (title, description, category, location, budget)
    ↓
Submit to /api/jobs
    ↓
Backend validates & saves job
    ↓
Job appears in "My Jobs"
    ↓
Workers can see job in "Browse Jobs"
    ↓
Workers apply to job
    ↓
Client receives applications
    ↓
Client reviews & accepts/rejects
    ↓
Accepted worker gets notification
    ↓
Real-time messaging enabled
```

### 3. Service Listing Flow (Worker)

```
Worker logs in
    ↓
Navigate to Admin Dashboard (if admin) or Dashboard
    ↓
Click "Add Service"
    ↓
Fill service details:
  - Title, description
  - Category, subcategory
  - Location, price
  - Images
  - Features
    ↓
Submit to /api/services
    ↓
Backend validates & saves
    ↓
Service appears on homepage
    ↓
Customers can browse & contact
```

### 4. Application Flow (Worker → Client)

```
Worker browses jobs
    ↓
Finds suitable job
    ↓
Clicks "Apply"
    ↓
Fills application form (message, location)
    ↓
Submit to /api/applications
    ↓
Backend creates application
    ↓
Client sees application in "My Jobs"
    ↓
Client reviews application
    ↓
Client accepts/rejects
    ↓
Status updated in database
    ↓
Worker notified of decision
    ↓
If accepted: messaging enabled
```

### 5. Real-time Messaging Flow

```
Application accepted
    ↓
Both parties can access messages
    ↓
User opens Messages section
    ↓
Socket.IO connection established
    ↓
Join conversation room (applicationId)
    ↓
User types message
    ↓
Emit 'send_message' event
    ↓
Backend saves to MongoDB
    ↓
Broadcast to room via Socket.IO
    ↓
Other user receives message instantly
    ↓
Message displayed in chat
```

### 6. Admin Content Management Flow

```
Admin logs in
    ↓
Access /hamrosewa dashboard
    ↓
Navigate to section (Services, Users, AMC, etc.)
    ↓
Perform CRUD operations
    ↓
Changes saved to MongoDB
    ↓
Frontend reflects changes immediately
    ↓
Public pages updated dynamically
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "client" | "worker"
}

Response: {
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

### Job Endpoints

#### Get All Jobs
```http
GET /api/jobs
Response: {
  "success": true,
  "data": [...]
}
```

#### Create Job (Protected)
```http
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Need Plumber",
  "description": "Fix kitchen sink",
  "category": "Plumbing",
  "location": "Kathmandu",
  "budget": 5000
}
```

#### Get My Jobs (Protected)
```http
GET /api/jobs/my-jobs
Authorization: Bearer {token}
```

### Application Endpoints

#### Apply to Job (Protected)
```http
POST /api/applications
Authorization: Bearer {token}
Content-Type: application/json

{
  "job": "job_id",
  "message": "I'm interested",
  "workerLocation": "Kathmandu"
}
```

#### Get My Applications (Protected)
```http
GET /api/applications/my-applications
Authorization: Bearer {token}
```

#### Update Application Status (Protected)
```http
PATCH /api/applications/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved" | "rejected"
}
```

### Service Endpoints

#### Get All Services
```http
GET /api/services
```

#### Create Service (Admin)
```http
POST /api/services
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Professional Plumbing",
  "description": "Expert plumbing services",
  "category": "category_id",
  "location": "Kathmandu",
  "price": 1000,
  "images": [...]
}
```

### Category Endpoints

#### Get Parent Categories
```http
GET /api/categories/parent
```

#### Get All Categories
```http
GET /api/categories/all
```

#### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Plumbing",
  "slug": "plumbing",
  "parent": null | "parent_id"
}
```

### AMC Package Endpoints

#### Get All AMC Packages
```http
GET /api/amc-packages
```

#### Get Single AMC Package
```http
GET /api/amc-packages/:id
```

#### Create AMC Package (Admin)
```http
POST /api/amc-packages
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Plumbing AMC Packages",
  "category": "Plumbing",
  "cardImage": "url",
  "heroImage": "url",
  "description": "...",
  "pricingTiers": [...],
  "benefits": [...]
}
```

---

## 🗄 Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['client', 'worker', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Job Schema
```javascript
{
  title: String (required),
  description: String (required),
  category: String (required),
  location: String (required),
  budget: Number (required),
  status: String (enum: ['pending', 'accepted', 'confirmed', 'completed']),
  client: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Application Schema
```javascript
{
  job: ObjectId (ref: 'Job'),
  worker: ObjectId (ref: 'User'),
  workerLocation: String,
  message: String,
  status: String (enum: ['requested', 'approved', 'rejected']),
  createdAt: Date,
  updatedAt: Date
}
```

### Service Schema
```javascript
{
  title: String (required),
  slug: String (unique),
  shortDescription: String,
  description: String (required),
  category: ObjectId (ref: 'Category'),
  location: String,
  price: Number,
  priceLabel: String,
  rating: Number,
  images: [{ url: String, isPrimary: Boolean }],
  featured: Boolean,
  popular: Boolean,
  provider: {
    name: String,
    verified: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Category Schema
```javascript
{
  name: String (required, unique),
  slug: String (required, unique),
  parent: ObjectId (ref: 'Category') | null,
  createdAt: Date,
  updatedAt: Date
}
```

### AMCPackage Schema
```javascript
{
  title: String (required, unique),
  category: String (enum: ['Plumbing', 'Electrical', 'Computer', 'AC Maintenance', 'Home Appliance']),
  cardImage: String,
  heroImage: String,
  description: String,
  pricingTiers: [{
    name: String,
    price: Number,
    duration: String,
    features: [String]
  }],
  whyChooseHeading: String,
  benefits: [{
    title: String,
    description: String
  }],
  isActive: Boolean,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  application: ObjectId (ref: 'Application'),
  sender: ObjectId (ref: 'User'),
  receiver: ObjectId (ref: 'User'),
  content: String (required),
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 Frontend Pages

### Public Pages
- **/** - Homepage with hero, categories, featured services, AMC packages
- **/about** - About Hamro Sewa with mission, statistics, team
- **/services** - Browse all services with filters and search
- **/service/[id]** - Service detail page
- **/category/[name]** - Services by category
- **/amc-packages** - AMC packages listing
- **/amc-packages/[id]** - AMC package detail page
- **/contact** - Contact form and information
- **/login** - User login
- **/register** - User registration

### Protected Pages (User Dashboard)
- **/dashboard** - Main dashboard (role-based content)
  - Dashboard overview
  - Browse jobs (workers)
  - My jobs (clients)
  - My applications (workers)
  - Messages (real-time chat)

### Admin Pages
- **/hamrosewa** - Admin dashboard
  - Dashboard overview with statistics
  - Services Hero management
  - Add/Edit services
  - All services list
  - Service categories management
  - Users management
  - Jobs monitoring
  - AMC packages management
  - Settings

---

## 🎛 Admin Dashboard

### Dashboard Features

#### 1. Dashboard Section
- Total users count
- Total services count
- Total jobs count
- Recent activity

#### 2. Services Hero Section
- Edit hero section for services page
- Update title, subtitle
- Change background image
- Adjust overlay opacity
- Edit search placeholders
- Live preview

#### 3. Services Management
- Add new services
- Edit existing services
- Delete services
- Upload multiple images
- Set featured/popular status
- Manage pricing

#### 4. Category Management
- Create parent categories
- Create subcategories
- Edit categories
- Delete categories
- View category hierarchy

#### 5. Users Management
- View all users
- Filter by role (client/worker/admin)
- View user details
- Manage user status

#### 6. Jobs Management
- View all jobs
- Monitor job status
- View applications per job
- Moderate content

#### 7. AMC Packages Management
- Create packages by category
- Add multiple pricing tiers
- Manage benefits
- Edit section heading
- Upload images
- Set active/inactive status

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/hamro-sewa
# or MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hamro-sewa

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# CORS (if needed)
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Socket.IO (if different from API)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password encryption
3. **Role-Based Access Control**: Middleware for route protection
4. **Input Validation**: Server-side validation for all inputs
5. **CORS Configuration**: Controlled cross-origin requests
6. **Environment Variables**: Sensitive data protection

---

## 🚦 Running in Production

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Set strong JWT_SECRET
4. Enable HTTPS
5. Configure proper CORS origins
6. Use process manager (PM2)

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Deploy to Vercel/Netlify or custom server

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for frontend
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Component Structure
- Keep components small and focused
- Use TypeScript interfaces
- Implement proper error handling
- Add loading states

### API Development
- Follow RESTful conventions
- Return consistent response format
- Handle errors gracefully
- Add proper status codes

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check if MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity

**JWT Token Invalid**
- Clear localStorage
- Re-login
- Check JWT_SECRET matches

**Port Already in Use**
- Change PORT in .env
- Kill process using the port
- Use different port number

**CORS Error**
- Check CORS configuration in server.js
- Verify CLIENT_URL in backend
- Check API URL in frontend

---

## 📞 Support

For issues, questions, or contributions:
- Email: support@hamrosewa.com
- GitHub: [Repository URL]

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Development Team

Developed with ❤️ for connecting service providers with customers across Nepal.

**Version**: 1.0.0  
**Last Updated**: 2024

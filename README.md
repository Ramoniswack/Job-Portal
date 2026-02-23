# Hamro Sewa - Frontend Application

Next.js frontend application for the Hamro Sewa service marketplace platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Frontend Workflow](#frontend-workflow)
- [Styling](#styling)
- [Deployment](#deployment)

---

## 🎯 Overview

The frontend application provides a modern, responsive user interface for the Hamro Sewa platform. Built with Next.js 14 using the App Router, it offers server-side rendering, optimized performance, and excellent SEO.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Material Symbols
- **HTTP Client**: Fetch API
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router
- **Forms**: Native HTML5 with React

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── about/                     # About page
│   │   ├── components/
│   │   │   ├── AboutHero.tsx
│   │   │   ├── AboutMission.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── WhyChooseUs.tsx
│   │   │   ├── JoinPlatform.tsx
│   │   │   └── Statistics.tsx
│   │   └── page.tsx
│   ├── amc-packages/              # AMC packages
│   │   ├── [id]/
│   │   │   └── page.tsx           # Package detail page
│   │   └── page.tsx               # Packages listing
│   ├── category/                  # Category pages
│   │   └── [name]/
│   │       └── page.tsx           # Services by category
│   ├── components/                # Shared components
│   │   ├── Navbar.tsx             # Main navigation
│   │   ├── Footer.tsx             # Footer
│   │   ├── Hero.tsx               # Homepage hero
│   │   ├── Category.tsx           # Category grid
│   │   ├── FeaturedServices.tsx   # Featured services
│   │   ├── PopularServices.tsx    # Popular services
│   │   ├── AMCPackages.tsx        # AMC packages section
│   │   ├── Testimonials.tsx       # Customer reviews
│   │   ├── FAQ.tsx                # FAQ section
│   │   ├── WelcomePopup.tsx       # Welcome modal
│   │   ├── WhatsAppButton.tsx     # WhatsApp floating button
│   │   └── ConfirmDialog.tsx      # Confirmation dialog
│   ├── contact/                   # Contact page
│   │   └── page.tsx
│   ├── dashboard/                 # User dashboard
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNavbar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── CreateJobModal.tsx
│   │   │   ├── ApplyJobModal.tsx
│   │   │   └── sections/
│   │   │       ├── DashboardSection.tsx
│   │   │       ├── BrowseJobsSection.tsx
│   │   │       ├── MyJobsSection.tsx
│   │   │       ├── MyApplicationsSection.tsx
│   │   │       ├── MessagesSection.tsx
│   │   │       ├── ViewPostsSection.tsx
│   │   │       ├── AddPostSection.tsx
│   │   │       └── PostCategoriesSection.tsx
│   │   └── page.tsx
│   ├── hamrosewa/                 # Admin dashboard
│   │   ├── sections/
│   │   │   ├── DashboardSection.tsx
│   │   │   ├── UsersSection.tsx
│   │   │   ├── JobsSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── AddServiceSection.tsx
│   │   │   ├── ServiceCategoriesSection.tsx
│   │   │   ├── AMCPackagesSection.tsx
│   │   │   └── ServicesHeroSection.tsx
│   │   └── page.tsx
│   ├── login/                     # Login page
│   │   └── page.tsx
│   ├── register/                  # Registration page
│   │   └── page.tsx
│   ├── service/                   # Service pages
│   │   └── [id]/
│   │       └── page.tsx           # Service detail page
│   ├── services/                  # Services listing
│   │   └── page.tsx
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage
│   └── globals.css                # Global styles
├── lib/
│   ├── api.ts                     # API utility functions
│   └── utils.ts                   # Helper functions
├── public/
│   └── logo.png                   # Logo and assets
├── .env.local                     # Environment variables
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running on port 5000

### Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. **Run development server:**
```bash
npm run dev
```

Application will run on `http://localhost:3000`

4. **Build for production:**
```bash
npm run build
npm start
```
---
## 🔐 Environment Variables
Create a `.env.local` file in the frontend root:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Socket.IO (if different from API)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```
---
## 🌐 Pages & Routes
### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, categories, featured services, AMC packages |
| `/about` | About | Company information, mission, team |
| `/services` | Services Listing | Browse all services with filters |
| `/service/[id]` | Service Detail | Individual service information |
| `/category/[name]` | Category Services | Services filtered by category |
| `/amc-packages` | AMC Packages | Annual maintenance packages |
| `/amc-packages/[id]` | Package Detail | Individual package information |
| `/contact` | Contact | Contact form and information |
| `/login` | Login | User authentication |
| `/register` | Registration | New user signup |

### Protected Routes (Requires Authentication)

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/dashboard` | User Dashboard | Client/Worker | Role-based dashboard |
| `/hamrosewa` | Admin Dashboard | Admin only | Platform management |

---

## 🧩 Components

### Shared Components

#### Navbar.tsx
- Main navigation bar
- Location selector with geolocation
- User authentication status
- Responsive mobile menu
- Links to all main pages

#### Footer.tsx
- Company information
- Quick links
- Social media links
- Copyright information

#### Hero.tsx
- Homepage hero section
- Search functionality
- Location-based search
- Call-to-action buttons

#### Category.tsx
- Service category grid
- Dynamic category loading
- Category icons and images
- Links to category pages

### Dashboard Components

#### DashboardLayout.tsx
- Main dashboard wrapper
- Sidebar navigation
- Top navbar
- Content area
- Role-based rendering

#### Sidebar.tsx
- Navigation menu
- Active section highlighting
- Role-based menu items
- Mobile responsive

#### MessagesSection.tsx
- Real-time chat interface
- Socket.IO integration
- Message history
- Typing indicators

---

## 📊 State Management

### Local State (useState)
Used for component-level state:
- Form inputs
- Modal visibility
- Loading states
- UI toggles

### localStorage
Used for persistent data:
- Authentication token
- User information
- Location preference

### Example State Management

```typescript
// Authentication state
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [token, setToken] = useState('');

// Load from localStorage
useEffect(() => {
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('currentUser');
  
  if (storedUser) {
    setCurrentUser(JSON.parse(storedUser));
  }
  setToken(storedToken || '');
}, []);
```

---

## 🔌 API Integration

### API Utility (lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET request
export const fetchData = async (endpoint: string) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
};

// POST request with auth
export const postData = async (endpoint: string, data: any, token: string) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### API Calls Example

```typescript
// Fetch services
const fetchServices = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/services');
    const data = await response.json();
    setServices(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Create job (protected)
const createJob = async (jobData: any) => {
  try {
    const response = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🔐 Authentication Flow

### 1. User Registration

```
User fills registration form
    ↓
Submit to /api/users/register
    ↓
Receive token + user data
    ↓
Store in localStorage:
  - authToken
  - currentUser
    ↓
Redirect to dashboard
```

### 2. User Login

```
User enters credentials
    ↓
Submit to /api/users/login
    ↓
Receive token + user data
    ↓
Store in localStorage
    ↓
Redirect based on role:
  - Admin → /hamrosewa
  - Client/Worker → /dashboard
```

### 3. Protected Route Access

```
User navigates to protected route
    ↓
useEffect checks localStorage
    ↓
If no token:
  → Redirect to /login
    ↓
If token exists:
  → Load user data
  → Render page
```

### 4. Logout

```
User clicks logout
    ↓
Clear localStorage:
  - Remove authToken
  - Remove currentUser
    ↓
Redirect to /login
```

---

## 🔄 Frontend Workflow

### 1. Homepage Load Workflow

```
User visits /
    ↓
page.tsx renders
    ↓
Components mount:
  - Navbar
  - Hero
  - Category
  - FeaturedServices
  - PopularServices
  - AMCPackages
  - Testimonials
  - FAQ
  - Footer
    ↓
Each component fetches data:
  - Categories from /api/categories
  - Services from /api/services
  - AMC packages from /api/amc-packages
    ↓
Data displayed to user
```

### 2. Service Browse Workflow

```
User clicks "Services"
    ↓
Navigate to /services
    ↓
page.tsx loads
    ↓
Fetch services from API
    ↓
Fetch categories for filters
    ↓
Fetch hero section data
    ↓
Display services grid
    ↓
User applies filters:
  - Search query
  - Location
  - Category
  - Sort by
    ↓
Filter services client-side
    ↓
Update display
```
### 3. Job Posting Workflow (Client)

```
Client logs in
    ↓
Navigate to /dashboard
    ↓
Click "Post a Job"
    ↓
CreateJobModal opens
    ↓
Fill job form:
  - Title
  - Description
  - Category
  - Location
  - Budget
    ↓
Submit form
    ↓
POST to /api/jobs with token
    ↓
Receive response
    ↓
Close modal
    ↓
Refresh jobs list
    ↓
Job appears in "My Jobs"
```

### 4. Job Application Workflow (Worker)

```
Worker logs in
    ↓
Navigate to /dashboard
    ↓
Click "Browse Jobs"
    ↓
Fetch all jobs from API
    ↓
Display jobs list
    ↓
Worker clicks "Apply"
    ↓
ApplyJobModal opens
    ↓
Fill application form:
  - Message
  - Location
    ↓
Submit application
    ↓
POST to /api/applications with token
    ↓
Receive response
    ↓
Close modal
    ↓
Application appears in "My Applications"
```
### 5. Real-time Messaging Workflow

```
Application accepted
    ↓
User opens Messages section
    ↓
Socket.IO connection established
    ↓
Join conversation room:
  socket.emit('join_conversation', applicationId)
    ↓
Fetch message history from API
    ↓
Display messages
    ↓
User types message
    ↓
Click send
    ↓
Emit message:
  socket.emit('send_message', data)
    ↓
Server broadcasts to room
    ↓
Receive message:
  socket.on('receive_message', message)
    ↓
Update UI with new message
```

### 6. Admin Dashboard Workflow

```
Admin logs in
    ↓
Redirect to /hamrosewa
    ↓
Dashboard loads
    ↓
Fetch statistics:
  - Total users
  - Total services
  - Total jobs
    ↓
Display dashboard
    ↓
Admin selects section:
  - Services
  - Users
  - Jobs
  - AMC Packages
  - Categories
    ↓
Fetch section data
    ↓
Display in table/grid
    ↓
Admin performs action:
  - Create
  - Edit
  - Delete
    ↓
Send request to API with token
    ↓
Receive response
    ↓
Update UI
    ↓
Show success message
```

### 7. Service Detail Page Workflow

```
User clicks on service
    ↓
Navigate to /service/[slug]
    ↓
page.tsx loads
    ↓
Extract slug from URL
    ↓
Fetch service data:
  GET /api/services/:slug
    ↓
Display service details:
  - Images
  - Title & description
  - Price
  - Location
  - Features
  - Provider info
    ↓
User can:
  - View images
  - Read description
  - Contact provider
  - Book service
```

### 8. Category Filter Workflow

```
User on /services page
    ↓
Clicks category filter
    ↓
Update selectedCategory state
    ↓
Filter services array:
  - Match category ID
  - Include subcategories
    ↓
Update displayed services
    ↓
User can combine filters:
  - Category + Search
  - Category + Location
  - Category + Sort
    ↓
All filters applied client-side
    ↓
Display filtered results
```

---

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with custom configuration:

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#26cf71',
        'primary-dark': '#1eb863'
      }
    }
  }
}
```

### Theme Colors

- **Primary Green**: `#26cf71`
- **Primary Dark**: `#1eb863`
- **Text**: Gray scale (gray-600, gray-700, gray-900)
- **Background**: White, gray-50, gray-100

### Responsive Design

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px), `lg:` (≥ 1024px)
- **Large Desktop**: `xl:` (≥ 1280px)

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Import repository
- Configure environment variables
- Deploy

3. **Environment Variables**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Manual Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

3. **Use PM2 for process management:**
```bash
pm2 start npm --name "hamro-sewa-frontend" -- start
```

---

## 📱 Progressive Web App (PWA)

The application can be enhanced with PWA features:
- Offline support
- Install to home screen
- Push notifications
- Background sync

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] User registration
- [ ] User login
- [ ] Browse services
- [ ] Search functionality
- [ ] Filter services
- [ ] View service details
- [ ] Post a job (client)
- [ ] Apply to job (worker)
- [ ] Real-time messaging
- [ ] Admin dashboard access
- [ ] CRUD operations (admin)
- [ ] Responsive design
- [ ] Mobile menu

---

## 🔧 Development Tips

### Hot Reload
Next.js provides automatic hot reload during development.

### TypeScript
Use TypeScript interfaces for type safety:

```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'worker' | 'admin';
}
```

### Component Organization
- Keep components small and focused
- Use TypeScript for props
- Extract reusable logic to custom hooks
- Use proper file naming conventions

---

## 📞 Support

For frontend issues or questions:
- Email: dev@hamrosewa.com

---

**Version**: 1.0.0  
**Last Updated**: 2024

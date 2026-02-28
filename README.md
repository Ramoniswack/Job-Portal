# Hamro Sewa - Frontend

A modern, responsive Next.js 15 application for the Hamro Sewa service booking platform with real-time messaging, admin dashboard, and comprehensive service management.

## 🚀 Features

### Public Features
- **Service Browsing** - Browse and search services by category
- **Service Details** - Detailed service pages with booking functionality
- **AMC Packages** - Annual Maintenance Contract packages with pricing tiers
- **Category Navigation** - Organized service categories
- **Responsive Design** - Mobile-first, fully responsive UI
- **Dark Mode Support** - System-aware dark/light theme

### User Features
- **Authentication** - Secure login/registration
- **Service Booking** - Book services with custom details
- **Booking Management** - Track booking status
- **Real-time Messaging** - Chat with service providers
- **Profile Management** - Update user information
- **Booking History** - View past and current bookings

### Admin Dashboard
- **Service Approval** - Review and approve pending services with transaction amounts
- **AMC Package Approval** - Approve packages with pricing
- **Gateway Approval** - First-level booking approval with transaction tracking
- **Transaction Management** - View all transactions with analytics
- **User Management** - Manage platform users
- **Statistics Dashboard** - Visual analytics with pie charts
- **Category Management** - CRUD operations for categories
- **Job Postings** - Manage job listings

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env.local` file in the frontend root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase Configuration (Optional - for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Start development server**
```bash
npm run dev
```

The application will start on `http://localhost:3000`

5. **Build for production**
```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx              # Home page
│   │   ├── services/             # Services listing
│   │   ├── service/[id]/         # Service detail
│   │   ├── amc-packages/         # AMC packages
│   │   ├── about/                # About page
│   │   ├── contact/              # Contact page
│   │   └── category/[name]/      # Category pages
│   ├── components/               # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Category.tsx
│   │   └── ...
│   ├── dashboard/                # User dashboard
│   │   └── components/
│   │       └── sections/
│   ├── hamrosewa/                # Admin dashboard
│   │   ├── page.tsx
│   │   ├── components/
│   │   └── sections/
│   │       ├── DashboardSection.tsx
│   │       ├── ServicesSection.tsx
│   │       ├── PendingServicesSection.tsx
│   │       ├── PendingAMCPackagesSection.tsx
│   │       ├── GatewayBookingsSection.tsx
│   │       ├── TransactionsSection.tsx
│   │       └── ...
│   ├── api/                      # API routes
│   │   └── upload/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── public/                       # Static assets
└── package.json
```

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Charts**: Recharts for analytics
- **Real-time**: Socket.io client
- **Notifications**: Sonner (toast notifications)
- **HTTP Client**: Fetch API
- **State Management**: React hooks

## 🔐 Authentication

### Login Flow
1. User enters credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token sent with protected API requests

### Protected Routes
- `/dashboard` - User dashboard
- `/hamrosewa` - Admin dashboard (admin role required)

### Role-Based Access
- **Admin**: Full dashboard access, approval workflows
- **Worker**: Service management, booking management
- **Client**: Booking services, viewing bookings

## 📱 Key Pages

### Public Pages
- `/` - Home page with featured services
- `/services` - All services listing with filters
- `/service/[id]` - Service detail and booking
- `/amc-packages` - AMC packages listing
- `/amc-packages/[id]` - Package detail
- `/category/[name]` - Category-specific services
- `/about` - About page
- `/contact` - Contact page

### User Dashboard (`/dashboard`)
- My Services
- My Bookings
- Service Bookings (for service providers)
- Messages
- Profile Management

### Admin Dashboard (`/hamrosewa`)
- **Dashboard** - Statistics and overview with pie charts
- **Services** - All services management
- **Pending Services** - Approve/reject with amount input
- **Pending Packages** - Approve/reject AMC packages with amount
- **Gateway Approval** - First-level booking approval with amount
- **Transactions** - View all transactions with filters and export
- **Service Bookings** - Manage all bookings
- **AMC Bookings** - Manage AMC bookings
- **Categories** - Category management
- **Users** - User management
- **Jobs** - Job postings
- **Messages** - Admin messaging

## 🎯 Key Features Implementation

### Approval Workflows

#### Service Approval
```typescript
// Admin clicks Approve → Modal with amount input
// Amount entered → API call with amount
// Backend creates transaction automatically
// Service becomes visible to public
```

#### AMC Package Approval
```typescript
// Same flow as service approval
// Modal with amount input
// Transaction created on approval
```

#### Gateway Booking Approval
```typescript
// Admin reviews booking
// Enters transaction amount
// Creates transaction record
// Booking moves to service owner
```

### Transaction Tracking
- Automatic creation on all approvals
- Real-time statistics dashboard
- Pie chart visualization
- Filter by type (service/package/booking)
- Export to CSV functionality

### Real-time Messaging
- Socket.io integration
- Conversation-based chat
- Message notifications
- Support for job applications, service bookings, and AMC bookings

### Image Upload
- Cloudinary integration via backend API
- Multiple image support for services
- Single image for packages
- Drag-and-drop interface

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, desktop optimized
- **Dark Mode** - System-aware theme switching
- **Loading States** - Skeleton loaders and spinners
- **Toast Notifications** - User feedback for actions
- **Modal Dialogs** - Confirmation and input modals
- **Form Validation** - Client-side validation
- **Breadcrumbs** - Navigation context
- **Pagination** - For large data sets
- **Search & Filters** - Service and category filtering

## 📊 Admin Dashboard Features

### Statistics Cards
- Total services, bookings, packages
- Revenue tracking
- Transaction counts by type
- Visual pie charts

### Approval Modals
- Consistent design across all approval types
- Amount input with NPR prefix
- Validation (amount > 0)
- Loading states
- Success/error feedback

### Transaction Management
- Filter by type and status
- Export to CSV
- Real-time refresh
- Detailed transaction view

## 🔔 Notifications

- Toast notifications for user actions
- Real-time message notifications
- Booking status updates
- Approval confirmations

## 🎨 Styling

### Color Scheme
- Primary: `#FF6B35` (Orange)
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue

### Tailwind Configuration
Custom colors and utilities configured in `tailwind.config.ts`

## 🚀 Performance Optimizations

- Next.js Image optimization
- Code splitting
- Lazy loading
- Server-side rendering where appropriate
- Static generation for public pages

## 🧪 Testing

### Test Accounts
```
Admin:
Email: admin@hamrosewa.com
Password: admin123

Worker:
Email: shyam@gmail.com
Password: password123

Client:
Email: client@example.com
Password: password123
```

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- Firebase credentials (if using push notifications)

## 🔧 Configuration

### API Integration
All API calls use the base URL from `NEXT_PUBLIC_API_URL` environment variable.

### Socket.io
Real-time features connect to the backend WebSocket server automatically.

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎯 Future Enhancements

- Payment gateway integration
- Advanced analytics
- Email notifications
- SMS notifications
- Multi-language support
- Progressive Web App (PWA)

## 📝 License

MIT

## 👥 Support

For issues and questions, please contact the development team.

## 🙏 Acknowledgments

Built with Next.js 15, React 19, and Tailwind CSS.

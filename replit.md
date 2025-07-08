# ABHI SOLUTIONS - Digital Voting System

## Overview

ABHI SOLUTIONS is a modern full-stack web application for secure digital voting. It provides a comprehensive voting platform with three main interfaces: public voting, administrative management, and real-time results visualization. The application is built using a modern tech stack with React frontend, Express backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot module replacement with Vite integration

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Database Schema
- **Candidates Table**: Stores candidate information (name, party, experience, vote count)
- **Votes Table**: Records individual votes with voter tokens for duplicate prevention
- **Admins Table**: Administrative user accounts with authentication credentials

### API Endpoints
- `GET /api/candidates` - Retrieve all candidates
- `POST /api/candidates` - Create new candidate (admin only)
- `PATCH /api/candidates/:id` - Update candidate information
- `DELETE /api/candidates/:id` - Remove candidate
- `POST /api/votes` - Cast a vote
- `GET /api/votes/stats` - Retrieve voting statistics
- `POST /api/admin/login` - Administrative authentication

### Frontend Components
- **VotingInterface**: Public voting component with candidate selection
- **AdminDashboard**: Administrative panel for candidate management
- **ResultsDashboard**: Real-time visualization of voting results with charts
- **AddCandidateModal**: Modal for adding new candidates

## Data Flow

1. **Voting Process**: Users select candidates through radio buttons, votes are validated and stored with unique voter tokens
2. **Authentication**: Admin login validates credentials against stored admin accounts
3. **Real-time Updates**: TanStack Query automatically refetches data to keep interfaces synchronized
4. **Data Validation**: All inputs validated using Zod schemas on both client and server

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Recharts**: Charting library for results visualization

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundling for production

### Database and Validation
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **Drizzle ORM**: Type-safe database toolkit
- **Zod**: Runtime type validation and parsing

## Deployment Strategy

The application uses a hybrid deployment approach:

### Development
- Vite development server with HMR for frontend
- Express server with TypeScript compilation via tsx
- Database schema synchronization with `drizzle-kit push`

### Production
- Frontend built to static assets via Vite
- Backend bundled with ESBuild for Node.js runtime
- Single process serving both static files and API endpoints
- Environment-based configuration for database connections

### Build Process
1. `npm run build` - Compiles frontend assets and bundles backend
2. Static files served from `dist/public`
3. API requests handled by Express server
4. Database migrations applied automatically

## Changelog
```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Updated admin credentials to UNIQUE/UNIQUE123, removed demo credentials from login, moved results view to admin dashboard only, added auto-refresh after voting
- July 05, 2025. Rebranded application from "VoteSecure" to "ABHI SOLUTIONS", added custom logo and copyright footer
- July 05, 2025. Implemented royal purple/indigo color scheme, created mobile-friendly responsive design, removed "royal" branding terminology, updated candidate cards to maintain desktop-style horizontal layout on all screen sizes
- July 08, 2025. Added 15-second voting cooldown system with timer, progress bar, and beep sounds
- July 08, 2025. Removed auto-refresh after voting for continuous voting experience
- July 08, 2025. Removed sample candidate data from database initialization
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
Security: Admin credentials should be unique (UNIQUE/UNIQUE123) and not displayed publicly
UI/UX: Remove public access to results view, add auto-refresh after voting
Branding: Application name is "ABHI SOLUTIONS" with custom logo and copyright footer
```
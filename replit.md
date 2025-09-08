# Overview

This is a comprehensive service center management system built for Sokany, designed to handle maintenance requests, user management, warehouses, spare parts, and administrative functions. The application provides a complete workflow for managing service centers with role-based access control, inventory management, and activity tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and bundling
- **Internationalization**: Arabic (RTL) language support with proper font handling

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless hosting
- **API Design**: RESTful API structure with centralized error handling
- **File Structure**: Monorepo structure with shared schema between client and server
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot module replacement and runtime error overlay

## Database Design
- **Users**: Role-based system (admin, manager, technician, receptionist, warehouse_manager, customer)
- **Service Centers**: Multi-location support with manager assignments
- **Service Requests**: Complete workflow from creation to completion
- **Inventory Management**: Warehouses, spare parts, and stock tracking
- **Parts Transfer**: Inter-warehouse transfer system with approval workflow
- **Activity Logging**: Comprehensive audit trail for all system actions
- **Categories & Products**: Hierarchical organization of serviceable items

## Authentication & Authorization
- **Authentication**: Email/password based with status verification (active/inactive/pending)
- **Authorization**: Role-based access control with center-specific permissions
- **Session Management**: Persistent sessions with automatic cleanup
- **User Registration**: Admin approval required for new accounts

## Key Features
- **Dashboard**: Real-time statistics and recent activity overview
- **User Management**: CRUD operations with role assignment and approval workflow
- **Service Request Management**: Complete lifecycle tracking with status updates
- **Inventory System**: Multi-warehouse support with transfer capabilities
- **Reporting**: Analytics and performance metrics
- **Activity Logging**: Detailed audit trail for compliance and monitoring

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations (drizzle-orm, drizzle-kit)
- **Drizzle Zod**: Schema validation integration (drizzle-zod)

## UI Framework & Components
- **React**: Core framework (react, react-dom)
- **Radix UI**: Headless component primitives (@radix-ui/*)
- **shadcn/ui**: Pre-styled component library
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

## Development & Build Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing with Autoprefixer

## State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation

## Fonts & Styling
- **Google Fonts**: Poppins font family for Arabic/RTL support
- **Bootstrap Icons**: Icon library for UI elements
- **CSS Variables**: Theme customization and dark mode support

## Session & Storage
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

## Utilities
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class handling
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation
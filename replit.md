# Sales Day Planner

## Overview

The Sales Day Planner is a comprehensive web application designed to help sales professionals optimize their daily activities, manage meetings, track prospects, and maximize selling opportunities. The platform combines meeting management, prospect intelligence, and time blocking to create a unified sales productivity tool.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application uses a modern React-based frontend built with:

- **React 18** with TypeScript for type safety and component-based architecture
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** (React Query) for server state management, caching, and synchronization
- **React Hook Form** with Zod validation for form handling and validation
- **Shadcn/ui** component library built on Radix UI primitives for accessible, customizable UI components
- **Tailwind CSS** for utility-first styling with custom design tokens

The frontend follows a component-driven architecture with clear separation between:
- Pages (landing, dashboard, not-found)
- Reusable UI components (modals, panels, forms)
- Custom hooks for authentication and business logic
- Utility functions for common operations

### Backend Architecture

The backend is built with Express.js and follows RESTful API principles:

- **Express.js** server with TypeScript for the API layer
- **Drizzle ORM** for database operations with PostgreSQL
- **Neon Database** as the PostgreSQL database provider
- **Session-based authentication** using Express sessions with PostgreSQL storage
- **Replit Auth integration** for user authentication and authorization

The server implements a layered architecture:
- Route handlers for API endpoints
- Storage layer abstraction for database operations
- Middleware for authentication, logging, and error handling
- Separation of concerns between authentication, business logic, and data access

### Data Storage Solutions

The application uses PostgreSQL as the primary database with the following schema design:

- **Users table** - Stores user profiles with Replit Auth integration
- **Companies table** - Company information including size, revenue, and tech stack
- **Contacts table** - Individual contacts within companies
- **Meetings table** - Scheduled meetings with agenda, notes, and sales intelligence
- **Time Blocks table** - Planned time allocations for different activities
- **Daily Goals table** - Daily targets and progress tracking
- **Action Items table** - Follow-up tasks and reminders
- **Sessions table** - Session storage for authentication (required by Replit Auth)

The schema uses UUID primary keys and includes proper foreign key relationships and indexing for performance.

### Authentication and Authorization

The application implements Replit's OAuth-based authentication system:

- **OpenID Connect (OIDC)** integration with Replit's identity provider
- **Passport.js** strategy for handling OAuth flow
- **Session-based authentication** with secure cookie management
- **PostgreSQL session storage** for scalability and persistence
- **User profile synchronization** with Replit user data

All API routes are protected with authentication middleware, and the frontend handles authentication state through React Query.

## External Dependencies

### Third-Party Services

- **Replit Authentication** - OAuth provider for user authentication and identity management
- **Neon Database** - Serverless PostgreSQL database hosting with connection pooling
- **Replit Hosting** - Application deployment and runtime environment

### Key Libraries and Frameworks

- **UI Framework**: React 18 with TypeScript for type-safe component development
- **Styling**: Tailwind CSS with Shadcn/ui component system for consistent design
- **State Management**: TanStack Query for server state and React Hook Form for form state
- **Database**: Drizzle ORM with Neon's serverless PostgreSQL driver
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Routing**: Wouter for lightweight client-side routing
- **Validation**: Zod for runtime type checking and form validation
- **Development**: Vite for fast development and building, with TypeScript compilation

### Build and Development Tools

- **Vite** - Fast development server and build tool with HMR support
- **TypeScript** - Static type checking across frontend and backend
- **ESBuild** - Fast JavaScript bundling for production builds
- **Drizzle Kit** - Database migration and schema management tools
- **PostCSS** - CSS processing with Tailwind CSS integration

The application is designed to be deployed on Replit's platform with automatic environment provisioning and database setup.
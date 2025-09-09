# Overview

This is a real-time trivia game platform called "Fazzah" (فزه) - an Arabic interactive gaming application. The system allows users to create trivia games with custom categories and question counts, or join existing games using unique game codes. Players answer multiple-choice questions within time limits, and the system tracks scores, accuracy, and response times to generate leaderboards and comprehensive game statistics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing with pages for home, game creation, joining games, registration, gameplay, and results
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens for consistent theming, supporting both Arabic and English text
- **State Management**: TanStack Query (React Query) for server state management, caching, and API interactions
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Strategy**: Dual storage implementation with in-memory storage for development and PostgreSQL for production
- **API Design**: RESTful endpoints for games, players, questions, and answers with proper error handling
- **Development Tools**: Vite middleware integration for hot reloading during development

## Data Storage Design
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Schema Structure**: 
  - Games table with unique codes, categories, and question counts
  - Players table linked to games with scoring metrics
  - Questions table categorized by topic and difficulty
  - Game-question junction table for question ordering
  - Player answers table tracking responses and timing
- **Migration Strategy**: Drizzle Kit for schema migrations and database versioning

## Authentication & Session Management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Security**: Environment-based database URL configuration with proper credential management
- **Game Access**: Code-based game joining system without traditional user accounts

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Connection**: @neondatabase/serverless driver for optimized serverless connections

## UI Component Libraries
- **Radix UI**: Complete set of accessible, unstyled UI primitives including dialogs, dropdowns, form controls, and navigation components
- **Lucide React**: Icon library for consistent iconography throughout the application
- **Embla Carousel**: Touch-friendly carousel component for potential image galleries or question displays

## Development & Build Tools
- **Vite**: Fast build tool with React plugin and development server
- **Replit Integration**: Custom plugins for runtime error handling and development environment integration
- **PostCSS**: CSS processing with Tailwind CSS integration

## Utility Libraries
- **Zod**: Runtime type validation for API requests and form data
- **date-fns**: Date manipulation and formatting utilities
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation for games and entities

## Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod validation
- **Drizzle Zod**: Automatic Zod schema generation from Drizzle database schemas
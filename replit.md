# GameBank Discord Bot

## Overview

GameBank is a Discord bot with a comprehensive web dashboard that provides virtual banking services for gaming communities. The system consists of a React frontend dashboard and an Express.js backend with Discord.js integration, featuring real-time transaction monitoring, user balance management, merchant services, and bot command analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Discord-themed design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Bot Integration**: Discord.js v14 for Discord bot functionality
- **Development**: TSX for TypeScript execution in development

### Database Architecture
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Database**: PostgreSQL with persistent data storage
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Connection**: Neon serverless driver for production deployment
- **Storage**: DatabaseStorage class replacing in-memory storage for production use

## Key Components

### Database Schema
The system uses five main tables:
- **Users**: Discord user management with balances and account info
- **Merchants**: Virtual stores/services with categories (food, items, services)
- **Transactions**: Financial transaction records with status tracking
- **Bot Commands**: Audit log of all Discord bot command executions
- **Alerts**: System notifications for fraud detection and monitoring

### Discord Bot Features
- **Slash Commands**: Balance checking, transaction history, merchant browsing
- **User Management**: Automatic user registration and balance tracking
- **Transaction Processing**: Secure payment processing between users and merchants
- **Command Logging**: Complete audit trail of all bot interactions

### Dashboard Components
- **Real-time Analytics**: Live transaction monitoring and system stats
- **User Management**: Balance tracking and user activity monitoring
- **Merchant Administration**: Store management and revenue analytics
- **Alert System**: Fraud detection and system health monitoring
- **Command Center**: Bot command testing and monitoring interface

## Data Flow

### Transaction Processing
1. User initiates transaction via Discord bot command
2. Bot validates user balance and merchant availability
3. Transaction record created with "pending" status
4. Payment processing logic executes
5. User and merchant balances updated
6. Transaction status updated to "completed" or "failed"
7. Real-time dashboard updates reflect changes

### Bot Command Flow
1. Discord user executes slash command
2. Bot validates permissions and parameters
3. Database operations performed (queries/updates)
4. Command execution logged to bot_commands table
5. Formatted response sent back to Discord
6. Dashboard analytics updated in real-time

### Dashboard Data Sync
- TanStack Query handles automatic data fetching and caching
- Real-time updates through periodic refetching (10-30 second intervals)
- Optimistic updates for immediate UI feedback
- Error handling with automatic retry mechanisms

## External Dependencies

### Discord Integration
- **Discord.js**: Full Discord API wrapper for bot functionality
- **Discord OAuth**: User authentication (planned feature)
- **Slash Commands**: Modern Discord interaction system

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management
- **SSL Connections**: Secure database communication

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (implied by project structure)

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for frontend, TSX for backend
- **Development Server**: Express serves both API and static files
- **Database**: Connection to development PostgreSQL instance
- **Bot Testing**: Separate Discord application for development

### Production Build
- **Frontend**: Vite builds optimized React bundle to dist/public
- **Backend**: ESBuild compiles TypeScript server to dist/index.js
- **Static Serving**: Express serves built frontend from dist/public
- **Environment Variables**: Database URL, Discord tokens, and API keys

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Schema Sync**: `db:push` command for development schema updates
- **Version Control**: Migration files tracked in git
- **Rollback**: Drizzle supports migration rollbacks

### Bot Deployment
- **Always Online**: Bot runs as part of main server process
- **Command Registration**: Slash commands registered on startup
- **Error Handling**: Graceful error recovery and logging
- **Rate Limiting**: Built-in Discord.js rate limit handling

The architecture prioritizes type safety, real-time functionality, and scalability while maintaining a clean separation between the Discord bot, web dashboard, and data persistence layers.
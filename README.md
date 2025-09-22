# Real-Time Vehicle Tracking Backend

Backend system untuk real-time vehicle tracking NestJS + Socket.IO.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env file

# Setup database
npx prisma generate
npx prisma db push

# Start server
npm run start:dev
```

Server: `http://localhost:3000`

## API Endpoints

### Auth
```bash
POST /auth/register   # Register user
POST /auth/login      # Login
GET /auth/me          # Get user (protected)
```

### Customers (Protected)
```bash
GET /customers        # List all
POST /customers       # Create
GET /customers/:id    # Get by ID
PATCH /customers/:id  # Update
DELETE /customers/:id # Delete
```

### Vehicles (Protected)
```bash
GET /vehicles         # List all
POST /vehicles        # Create
GET /vehicles/:id     # Get by ID
PATCH /vehicles/:id   # Update
DELETE /vehicles/:id  # Delete
```


### Tracking (Protected)
```bash
GET /tracking/vehicles/:id/locations    # Location history
POST /tracking/vehicles/:id/start       # Start tracking
POST /tracking/vehicles/:id/stop        # Stop tracking
GET /tracking/active-vehicles           # Active vehicles
```

## Architecture

### DDD + Hexagonal Structure
```
src/
├── domain/           # Business entities
├── application/      # Services & use cases
├── infrastructure/   # Database, Redis
└── interface/        # Controllers, WebSocket
```

## Tech Stack

- **NestJS** - Backend framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Caching
- **Socket.IO** - Real-time WebSocket
- **JWT** - Authentication

## Docker Setup

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Run app
npm run start:dev
```
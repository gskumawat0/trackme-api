# TrackMe API

A flexible activity tracking API built with Node.js, TypeScript, PostgreSQL, and Prisma. Features include frequency-based activities (daily, weekly, monthly), automatic rollover of pending activities, and scheduled task creation using pg-boss.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Activity Management**: Create, read, update, and delete activities with different frequencies
- **Frequency Support**: Daily, weekly, and monthly activities
- **Status Tracking**: TODO, IN_PROGRESS, HOLD, DONE statuses
- **Rollover System**: Automatic rollover of pending activities to the next cycle
- **Scheduled Task Creation**: pg-boss scheduler creates activity logs at midnight
- **Activity Logging**: Track individual instances of activities with comments
- **Comment System**: Add, view, and delete comments on activity logs
- **Flexible Filtering**: Filter activities by frequency, status, date ranges, and rollover status
- **Comprehensive Testing**: Jest-based test suite with full coverage

## Database Schema

### Core Tables

- **users**: User accounts with authentication
- **activities**: Activity definitions with frequency and status
- **activity_logs**: Individual instances of activities with start/end dates
- **activity_log_comments**: Comments on activity logs

### Enums

- **Frequency**: DAILY, WEEKLY, MONTHLY
- **ActivityStatus**: TODO, IN_PROGRESS, HOLD, DONE

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp env.example .env
   # Edit .env with your database and configuration
   ```

4. Set up the database:

   ```bash
   yarn db:generate
   yarn db:push
   yarn db:seed
   ```

5. Start the development server:

   ```bash
   yarn dev
   ```

6. Start the worker (in a separate terminal):
   ```bash
   yarn worker:dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile

### Activities

- `GET /api/v1/activities` - Get all activities (with filtering)
- `POST /api/v1/activities` - Create a new activity
- `GET /api/v1/activities/:id` - Get a specific activity
- `PUT /api/v1/activities/:id` - Update an activity
- `DELETE /api/v1/activities/:id` - Delete an activity
- `GET /api/v1/activities/rollover/summary` - Get rollover summary
- `GET /api/v1/activities/rollover/activities` - Get activities with rollover info

### Activity Logs

- `GET /api/v1/activity-logs` - Get activity logs (with filtering)
- `GET /api/v1/activity-logs/:id` - Get a specific activity log
- `PATCH /api/v1/activity-logs/:id/status` - Update activity log status
- `POST /api/v1/activity-logs/:id/comments` - Add a comment to activity log
- `GET /api/v1/activity-logs/:id/comments` - Get comments for activity log
- `DELETE /api/v1/activity-logs/:id/comments/:commentId` - Delete a comment

## Activity Scheduling

The system uses pg-boss to automatically create activity logs at midnight (00:05):

- **Daily Activities**: Created every day at 00:05
- **Weekly Activities**: Created on Sundays at 00:05
- **Monthly Activities**: Created on the 1st of each month at 00:05

### Worker Management

Start the worker process to handle scheduled jobs:

```bash
# Development
yarn worker:dev

# Production
yarn worker:start
```

## Activity Rollover System

The rollover system automatically identifies activities that should appear in the current cycle but haven't been completed:

### Rollover Logic

- **Daily**: Activities from previous days that are still TODO or IN_PROGRESS
- **Weekly**: Activities from previous weeks that are still TODO or IN_PROGRESS
- **Monthly**: Activities from previous months that are still TODO or IN_PROGRESS

### Rollover Endpoints

- `GET /api/v1/activities/rollover/summary` - Get rollover statistics
- `GET /api/v1/activities/rollover/activities` - Get activities with rollover information

## Activity Logging System

Each activity instance is tracked in the `activity_logs` table:

### Features

- **Automatic Creation**: Logs are created by the scheduler
- **Status Tracking**: Individual log status independent of activity status
- **Date Ranges**: Each log has start and end dates based on frequency
- **Comments**: Add contextual notes to each log instance

### Comment System

- Add comments to track progress, notes, or issues
- Comments are timestamped and ordered by creation date
- Full CRUD operations for comments

## Query Parameters

### Activities Filtering

- `frequency`: Filter by frequency (DAILY, WEEKLY, MONTHLY)
- `status`: Filter by status (TODO, IN_PROGRESS, HOLD, DONE)
- `includeRollover`: Include rollover information (true/false)
- `startDate`: Filter activities starting from date
- `endDate`: Filter activities ending before date

### Activity Logs Filtering

- `activityId`: Filter by specific activity
- `status`: Filter by log status
- `startDate`: Filter logs starting from date
- `endDate`: Filter logs ending before date
- `comments`: Include comments in response (true/false)

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/trackme_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API Configuration
API_PREFIX=/api/v1

# PgBoss Configuration
PG_BOSS_DATABASE_URL="postgresql://username:password@localhost:5432/trackme_db"
PG_BOSS_SCHEMA=pgboss
PG_BOSS_RETENTION_DAYS=30
```

## Scripts

- `yarn dev` - Start development server
- `yarn start` - Start production server
- `yarn build` - Build TypeScript
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage
- `yarn db:generate` - Generate Prisma client
- `yarn db:push` - Push schema to database
- `yarn db:migrate` - Run database migrations
- `yarn db:studio` - Open Prisma Studio
- `yarn db:seed` - Seed database with sample data
- `yarn worker:start` - Start pg-boss worker
- `yarn worker:dev` - Start pg-boss worker in development mode
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting with Prettier
- `yarn format:all` - Format all files (including markdown, yaml, etc.)

## Testing

Run the test suite:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:coverage
```

## Code Formatting

This project uses Prettier for consistent code formatting.

### Format Code

```bash
yarn format
```

### Check Formatting

```bash
yarn format:check
```

### Format All Files

```bash
yarn format:all
```

### Prettier Configuration

The project includes a `.prettierrc` file with the following settings:

- Single quotes
- 2 spaces indentation
- 80 character line width
- Trailing commas in objects and arrays
- Semicolons at the end of statements

### Pre-commit Hook
A pre-commit script is available at `scripts/pre-commit.sh` that can be used with git hooks to automatically run formatting and linting checks before commits.

To use it with husky (optional):
```bash
# Install husky
yarn add -D husky

# Add pre-commit hook
npx husky add .husky/pre-commit "bash scripts/pre-commit.sh"
```

Or run manually:
```bash
bash scripts/pre-commit.sh
```

## Database Management

### Generate Prisma Client
```bash
yarn db:generate
```

### Push Schema Changes
```bash
yarn db:push
```

### Run Migrations
```bash
yarn db:migrate
```

### Seed Database
```bash
yarn db:seed
```

### Open Prisma Studio
```bash
yarn db:studio
```

## Architecture

### Project Structure
```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── workers/         # pg-boss worker files
└── __tests__/       # Test files
```

### Key Components
- **ActivityScheduler**: Handles scheduled task creation
- **WorkerManager**: Manages pg-boss jobs and scheduling
- **ActivityUtils**: Utility functions for activity logic
- **Rollover System**: Automatic rollover of pending activities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT
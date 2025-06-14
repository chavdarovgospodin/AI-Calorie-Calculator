<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

Calorie AI Tracker/Calculator NestJS backend API with TypeScript, Supabase, and Google AI integration

## Project setup

```bash
$ npm install
```

## Environment setup

```bash
# Copy environment example
$ cp .env.example .env

# Fill in your API keys and database URLs
# See .env.example for all required variables
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# debug mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# watch mode
$ npm run test:watch

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Code quality

```bash
# Run ESLint
$ npm run lint

# Fix ESLint issues
$ npm run lint:fix

# Type checking
$ npm run type-check

# Format code with Prettier
$ npm run format

# Check formatting
$ npm run format:check
```

## Health check

```bash
# Check if server is running
$ npm run health

# Or visit: http://localhost:3000/api/health
```

## Features

- 🤖 **AI Food Analysis** - Google Gemini integration for food recognition
- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📊 **Nutrition Tracking** - Comprehensive calorie and macro tracking
- 🏥 **Health Monitoring** - Built-in health checks and monitoring
- 🛡️ **Security** - Helmet, CORS, rate limiting, and validation
- 📱 **Mobile-Ready** - Optimized for React Native mobile app
- 🚀 **Performance** - Efficient caching and optimized queries
- 📈 **Scalable** - Modular architecture with proper separation

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Service**: Google Generative AI (Gemini)
- **Authentication**: JWT + Supabase Auth
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## Folder Structure

```
src/
├── ai/                 # AI service integration
│   ├── interfaces/     # AI response interfaces
│   ├── validation/     # AI input validation
│   └── ai.service.ts   # Google AI service
├── auth/              # Authentication module
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards
│   └── strategies/    # Passport strategies
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   ├── guards/        # Global guards
│   ├── interceptors/  # Response interceptors
│   └── pipes/         # Validation pipes
├── config/            # Configuration management
├── database/          # Database services
│   └── supabase.service.ts
├── food/              # Food tracking module
│   ├── dto/           # Food DTOs
│   └── food.service.ts
├── daily-logs/        # Daily logging module
├── activity/          # Activity tracking
├── users/             # User management
└── main.ts            # Application entry point
```

## API Endpoints

### Authentication

```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/refresh      # Refresh JWT token
POST   /api/auth/logout       # User logout
```

### Food Analysis

```
POST   /api/food/analyze/text   # Analyze food from text
POST   /api/food/analyze/image  # Analyze food from image
GET    /api/food/entries        # Get user's food entries
POST   /api/food/entries        # Add food entry
PUT    /api/food/entries/:id    # Update food entry
DELETE /api/food/entries/:id    # Delete food entry
```

### Daily Logs

```
GET    /api/daily-logs/dashboard    # Get daily dashboard
GET    /api/daily-logs/weekly       # Get weekly summary
GET    /api/daily-logs/:date        # Get specific date log
POST   /api/daily-logs              # Create/update daily log
```

### User Profile

```
GET    /api/users/profile           # Get user profile
PUT    /api/users/profile           # Update user profile
GET    /api/users/goals             # Get calorie goals
PUT    /api/users/goals             # Update calorie goals
```

### Health & Monitoring

```
GET    /api/health                  # Health check endpoint
GET    /api/health/detailed         # Detailed health status
```

## Database Schema

Main Supabase tables:

```sql
-- Users table
users (
  id: uuid PRIMARY KEY,
  email: varchar UNIQUE,
  created_at: timestamp,
  updated_at: timestamp
)

-- Daily logs
daily_logs (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  date: date,
  total_calories: integer,
  target_calories: integer,
  created_at: timestamp
)

-- Food entries
food_entries (
  id: uuid PRIMARY KEY,
  daily_log_id: uuid REFERENCES daily_logs(id),
  food_name: varchar,
  calories: integer,
  protein: decimal,
  carbs: decimal,
  fat: decimal,
  quantity: decimal,
  unit: varchar
)

-- Activity entries
activity_entries (
  id: uuid PRIMARY KEY,
  daily_log_id: uuid REFERENCES daily_logs(id),
  activity_type: varchar,
  duration_minutes: integer,
  calories_burned: integer
)
```

## Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Validation**: Input sanitization and validation
- **Rate Limiting**: Prevent abuse and DDoS
- **CORS**: Configured for mobile app origins
- **Headers**: Security headers with Helmet

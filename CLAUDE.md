# CLAUDE.md - AI Assistant Guide

## Overview

**AI-Calorie-Calculator** is a modern full-stack application for tracking calories and nutrition using AI-powered food analysis. This is a **monorepo** containing a NestJS backend API and a React Native mobile application.

### Tech Stack Summary

**Backend:**
- NestJS 11+ (TypeScript)
- Supabase (PostgreSQL + Auth)
- Google Gemini Flash AI
- JWT Authentication
- Passport.js

**Mobile:**
- React Native 0.81.5
- Expo 54
- TanStack React Query v5
- React Navigation
- AsyncStorage

**Shared:**
- TypeScript (strict mode)
- ESLint + Prettier
- npm workspaces

---

## Project Structure

```
/home/user/AI-Calorie-Calculator/
├── apps/
│   ├── backend/              # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # User management
│   │   │   ├── food/        # Food analysis & entries
│   │   │   ├── daily-logs/  # Daily tracking & dashboard
│   │   │   ├── activity/    # Activity tracking
│   │   │   ├── ai/          # Google Gemini integration
│   │   │   ├── database/    # Supabase service
│   │   │   ├── health/      # Health check endpoint
│   │   │   ├── common/      # Guards, decorators, interfaces, utils
│   │   │   └── main.ts      # Application entry point
│   │   ├── test/            # E2E tests (configured, not implemented)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   │
│   └── mobile/              # React Native Expo app
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   │   ├── ActivitySummary/
│       │   │   ├── AppNavigation/
│       │   │   ├── LoadingScreen/
│       │   │   └── RecentFood/
│       │   ├── screens/     # Screen components
│       │   │   ├── Auth/    # Login, Register
│       │   │   ├── Dashboard/ # HomeScreen
│       │   │   ├── FoodInput/
│       │   │   ├── Activity/
│       │   │   ├── ManualActivity/
│       │   │   ├── EditProfile/
│       │   │   ├── Settings/
│       │   │   └── HealthAppSelection/
│       │   ├── contexts/    # React Context providers
│       │   │   ├── AuthContext.tsx
│       │   │   └── ThemeContext.tsx
│       │   ├── hooks/       # Custom React hooks
│       │   │   ├── useActivity.ts
│       │   │   ├── useDashboard.ts
│       │   │   ├── useFood.ts
│       │   │   ├── useHealth.ts
│       │   │   ├── useHealthApp.ts
│       │   │   └── useUser.ts
│       │   ├── services/    # API and business logic
│       │   │   ├── api.ts
│       │   │   ├── auth.ts
│       │   │   ├── deviceHealth.ts
│       │   │   └── enums.ts
│       │   ├── types/       # TypeScript interfaces
│       │   └── utils/       # Utility functions
│       ├── package.json
│       └── tsconfig.json
│
├── .env.example             # Environment variables template
├── package.json             # Root workspace config
├── eslint.config.js         # Shared ESLint configuration
├── prettier.config.js       # Shared Prettier configuration
└── .github/workflows/       # CI/CD pipelines
    ├── ci.yml
    ├── pr-checks.yml
    └── minimal.yml
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (for mobile development)
- Docker (optional)

### Initial Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database credentials
   ```

   **Required environment variables:**
   - `SUPABASE_URL` - From Supabase dashboard
   - `SUPABASE_ANON_KEY` - From Supabase dashboard
   - `SUPABASE_SERVICE_KEY` - From Supabase dashboard (service role)
   - `JWT_SECRET` - Minimum 32 characters
   - `GOOGLE_AI_API_KEY` - From Google AI Studio

3. **Start development servers:**
   ```bash
   # Both apps concurrently
   npm run dev

   # Or individually
   npm run backend:dev   # Backend only (http://localhost:3000)
   npm run mobile:dev    # Mobile only (Expo)
   ```

### Common Commands

**Root-level:**
```bash
npm run format        # Format all code with Prettier + ESLint fix
npm run format:check  # Check formatting without changes
npm run lint          # Lint all workspaces
npm run lint:fix      # Fix linting issues
npm run lint:backend  # Lint backend only
npm run lint:mobile   # Lint mobile only
```

**Backend (cd apps/backend):**
```bash
npm run start:dev     # Development server with watch mode
npm run build         # Build for production
npm run start:prod    # Start production build
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
npm run type-check    # TypeScript type checking
npm run health        # Health check curl
```

**Mobile (cd apps/mobile):**
```bash
npm start             # Start Expo dev server
npm run android       # Run on Android emulator
npm run ios           # Run on iOS simulator
npm run web           # Run in web browser
```

---

## Architecture & Key Patterns

### Backend Architecture (NestJS)

#### Module Organization

The backend follows **NestJS modular architecture** with dependency injection:

**Pattern:**
```
module-name/
├── module-name.module.ts      # Module definition
├── module-name.controller.ts  # HTTP endpoints
├── module-name.service.ts     # Business logic
├── dto/                       # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
└── interfaces/                # TypeScript interfaces
```

#### Key Modules

1. **AuthModule** (`/apps/backend/src/auth/`)
   - **Endpoints:**
     - `POST /api/auth/register` - User registration
     - `POST /api/auth/login` - Login (returns access + refresh tokens)
     - `POST /api/auth/refresh` - Refresh access token
   - **Features:**
     - JWT with refresh token pattern (15min access, 30d refresh)
     - Auto-calculates daily calorie goals on registration
     - Rate limiting: 3 registrations/hour, 5 logins/5min

2. **FoodModule** (`/apps/backend/src/food/`)
   - **Endpoints:**
     - `POST /api/food/analyze/text` - Analyze food from text description
     - `POST /api/food/analyze/image` - Analyze food from photo (max 10MB)
     - `GET /api/food/entries?date=YYYY-MM-DD` - Get food entries for date
     - `DELETE /api/food/entries/:id` - Delete food entry
   - **Features:**
     - Dual-mode AI analysis (text + image)
     - Intelligent validation with confidence scoring
     - Pre-validation with keyword detection
     - Rate limiting: 8 text/min, 5 images/min

3. **DailyLogsModule** (`/apps/backend/src/daily-logs/`)
   - **Endpoints:**
     - `GET /api/daily-logs/dashboard?date=YYYY-MM-DD` - Complete dashboard data
     - `GET /api/daily-logs/weekly` - 7-day summary
     - `GET /api/daily-logs/monthly?year=&month=` - Monthly statistics
   - **Features:**
     - Auto-creates daily logs on first entry
     - Aggregates calories consumed and burned
     - Returns progress percentage and macros

4. **ActivityModule** (`/apps/backend/src/activity/`)
   - **Endpoints:**
     - `POST /api/activity/sync` - Sync activity data
     - `POST /api/activity/manual` - Manual activity entry
     - `GET /api/activity/summary?date=` - Activity summary
     - `GET /api/activity/preferences` - Get user preferences
     - `PUT /api/activity/preferences` - Update preferences
   - **Features:**
     - Multi-source activity tracking (Apple Health, Google Fit, Samsung Health, etc.)
     - Duplicate prevention with external IDs
     - Activity calorie calculation with intensity levels

5. **AiModule** (`/apps/backend/src/ai/`)
   - **Services:**
     - `ai.service.ts` - Google Gemini integration
     - `ai-validation.service.ts` - Intelligent input validation
   - **Features:**
     - Bulgarian language prompts for food analysis
     - Text and image-based analysis
     - Confidence scoring system
     - Fallback validation when AI unavailable

#### Common Utilities

**Calorie Calculation** (`/apps/backend/src/common/utils/calculateDailyCalories.ts`):
- Implements **Mifflin-St Jeor equation** for BMR
- Adjusts for activity level (TDEE calculation)
- Applies goal modifiers:
  - Lose weight: -500 cal/day (1 lb/week)
  - Maintain: 0 modifier
  - Gain weight: +500 cal/day (1 lb/week)

**Authentication Guard** (`/apps/backend/src/common/guards/jwt-auth.guard.ts`):
- Passport JWT strategy
- Validates JWT tokens from `Authorization: Bearer <token>` header
- Injects user object into request

#### Validation Pattern

All DTOs use `class-validator` decorators:

```typescript
import { IsEmail, MinLength, IsEnum, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  @Min(30)
  @Max(300)
  weight: number;
}
```

#### Security Features

- **Helmet** - Security headers
- **CORS** - Environment-specific origins
- **ThrottlerGuard** - Rate limiting (global + route-specific)
- **Input validation** - class-validator on all DTOs
- **JWT refresh pattern** - Short-lived access tokens

### Mobile Architecture (React Native)

#### State Management

**Primary: TanStack React Query v5**

Used for all server state management with auto-caching, refetching, and invalidation:

```typescript
// Example from useDashboard.ts
const { data, isLoading, refetch } = useQuery<DailyDashboard>({
  queryKey: ['dashboard', selectedDate],
  queryFn: async () => {
    const response = await apiClient.get(`/daily-logs/dashboard?date=${selectedDate}`);
    return response.data;
  },
  refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  staleTime: 1 * 60 * 1000,
});
```

**Mutations with optimistic updates:**

```typescript
const addFoodMutation = useMutation({
  mutationFn: (data) => apiClient.post('/food/analyze/text', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['dashboard']);
    queryClient.invalidateQueries(['foodEntries']);
    Toast.show({ type: 'success', text1: 'Food added!' });
  },
});
```

**Context for Auth State:**

`AuthContext` manages authentication state with reducer pattern:
- Handles: login, register, logout, token refresh
- Auto-refresh on app foreground
- Persistent authentication check with AsyncStorage

#### Data Fetching Pattern

**Axios Client** (`/apps/mobile/src/services/api.ts`):

```typescript
// Token injection interceptor
apiClient.interceptors.request.use((config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh and retry
    }
    return Promise.reject(error);
  }
);
```

**Request queue during token refresh** - Prevents multiple concurrent refresh requests

#### Navigation Structure

**React Navigation** (native-stack):

```
Unauthenticated Stack:
  - Login
  - Register

Authenticated Stack:
  - Home (Dashboard)
  - FoodInput
  - Activity
  - ManualActivity
  - UserSettings
  - EditProfile
  - HealthAppSelection (forced if not configured)
```

**Navigation Guards:**
- Checks health app selection on mount
- Forces HealthAppSelection screen if not configured
- Auto-redirects based on auth state

#### Custom Hooks Pattern

All data fetching is abstracted into custom hooks:

- `useDashboard()` - Dashboard data with auto-refresh
- `useFood()` - Food entries and mutations
- `useActivity()` - Activity data and sync
- `useUser()` - User profile management
- `useHealthApp()` - Health app integration

**Benefits:**
- Centralized data fetching logic
- Automatic caching and invalidation
- Easy to test and reuse
- Type-safe with TypeScript

---

## Coding Conventions

### Naming Patterns

**Backend (NestJS):**
- Files: `kebab-case.suffix.ts`
  - Controllers: `food.controller.ts`
  - Services: `auth.service.ts`
  - Modules: `users.module.ts`
  - DTOs: `register.dto.ts`
  - Interfaces: `user.interface.ts`
- Classes: `PascalCase` + Suffix
  - `AuthService`, `FoodController`, `JwtAuthGuard`
- Methods/Variables: `camelCase`

**Mobile (React Native):**
- Component files: `PascalCase.tsx`
  - `HomeScreen.tsx`, `ActivitySummary.tsx`
- Hooks: `use*.ts`
  - `useDashboard.ts`, `useFood.ts`
- Services: `camelCase.ts`
  - `api.ts`, `auth.ts`
- Folders: `PascalCase` for features, `camelCase` for utilities

### Import Order

ESLint enforces import grouping with newlines between:

```typescript
// 1. Built-in modules
import { useState } from 'react';

// 2. External dependencies
import { useQuery } from '@tanstack/react-query';

// 3. Internal modules
import { apiClient } from '@/services/api';

// 4. Parent imports
import { calculateCalories } from '../utils';

// 5. Sibling imports
import { FoodCard } from './FoodCard';

// 6. Index imports
import './styles';
```

### TypeScript Guidelines

- **Strict mode enabled** in all tsconfig files
- **Path aliases configured:**
  ```
  @/* → src/*
  @/components/* → src/components/*
  @/services/* → src/services/*
  ```
- **Prefer interfaces over types** for object shapes
- **Use enums for constants** (Gender, Goal, ActivityLevel, etc.)
- **Explicit return types** optional but encouraged for public APIs
- **No `any`** - Prefer `unknown` or proper typing (warnings enforced)

### Code Style

**Prettier configuration** (`prettier.config.js`):
- 2 spaces indentation
- Single quotes
- Trailing commas
- Semicolons required
- Line width: 80-100 characters

**ESLint rules:**
- No multiple empty lines (max 1)
- Unused vars must start with `_` or will warn
- `console.warn`, `console.error`, `console.info` allowed
- React Hooks rules enforced
- Import order enforced

### Comments

- **Bulgarian language** in AI prompts (for local context)
- **English** everywhere else
- **Emojis in logs** for visual distinction (✅ success, ❌ error, 🔍 info, ⚠️ warning)
- Avoid obvious comments - code should be self-documenting
- Document complex algorithms or business logic

---

## Database Schema

**Database:** Supabase (PostgreSQL)

### Tables

#### `users`
```sql
id: UUID (PK)
email: TEXT (unique)
password_hash: TEXT
age: INTEGER
gender: TEXT (enum: MALE, FEMALE)
height: DECIMAL (cm)
weight: DECIMAL (kg)
goal: TEXT (enum: LOSE_WEIGHT, MAINTAIN_WEIGHT, GAIN_WEIGHT)
activity_level: TEXT (enum: SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTREMELY_ACTIVE)
daily_calorie_goal: DECIMAL (calculated)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `daily_logs`
```sql
id: UUID (PK)
user_id: UUID (FK → users.id)
date: DATE (unique per user)
total_calories_consumed: DECIMAL
calories_burned: DECIMAL
activity_source: TEXT
last_activity_sync: TIMESTAMP
created_at: TIMESTAMP
updated_at: TIMESTAMP

CONSTRAINT: UNIQUE(user_id, date)
```

#### `food_entries`
```sql
id: UUID (PK)
user_id: UUID (FK → users.id)
daily_log_id: UUID (FK → daily_logs.id)
food_name: TEXT
description: TEXT
quantity: DECIMAL
unit: TEXT
calories: DECIMAL
protein: DECIMAL
carbs: DECIMAL
fat: DECIMAL
fiber: DECIMAL
sugar: DECIMAL
sodium: DECIMAL
ai_model_used: TEXT (tracks AI version)
created_at: TIMESTAMP
```

#### `activity_entries`
```sql
id: UUID (PK)
user_id: UUID (FK → users.id)
daily_log_id: UUID (FK → daily_logs.id)
activity_type: TEXT
activity_source: TEXT (enum: APPLE_HEALTH, GOOGLE_FIT, etc.)
duration: INTEGER (seconds)
calories_burned: DECIMAL
steps: INTEGER (optional)
distance: DECIMAL (optional, meters)
external_id: TEXT (for deduplication)
notes: TEXT
sync_timestamp: TIMESTAMP
created_at: TIMESTAMP

CONSTRAINT: UNIQUE(user_id, external_id) WHERE external_id IS NOT NULL
```

#### `user_activity_preferences`
```sql
user_id: UUID (PK, FK → users.id)
preferred_activity_source: TEXT
enabled_sources: TEXT[] (array)
auto_sync_enabled: BOOLEAN
sync_frequency: INTEGER (minutes)
activity_goal: INTEGER (steps/day)
calorie_calculation_method: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Relationships

- `users` → `daily_logs` (one-to-many)
- `users` → `food_entries` (one-to-many)
- `users` → `activity_entries` (one-to-many)
- `daily_logs` → `food_entries` (one-to-many)
- `daily_logs` → `activity_entries` (one-to-many)

### Supabase Management

- **No migration files** in repository (managed via Supabase dashboard)
- Scripts available: `npm run db:migrate`, `npm run db:reset` (backend)
- Connection handled by `SupabaseService` (`/apps/backend/src/database/supabase.service.ts`)

---

## API Reference

**Base URL:** `http://localhost:3000/api` (development)

### Authentication (Public)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/auth/register` | Create new user account | 3/hour |
| POST | `/auth/login` | Login and get tokens | 5/5min |
| POST | `/auth/refresh` | Refresh access token | - |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "age": 25,
  "gender": "MALE",
  "height": 180,
  "weight": 75,
  "goal": "LOSE_WEIGHT",
  "activity_level": "MODERATELY_ACTIVE"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": { ... }
}
```

### Food Endpoints (Protected)

All require `Authorization: Bearer <access_token>`

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/food/analyze/text` | Analyze text description | 8/min |
| POST | `/food/analyze/image` | Analyze food photo (max 10MB) | 5/min |
| GET | `/food/entries?date=YYYY-MM-DD` | Get food entries for date | - |
| DELETE | `/food/entries/:id` | Delete food entry | - |

**Analyze Text Request:**
```json
{
  "description": "200g chicken breast with rice and vegetables"
}
```

**Analyze Text Response:**
```json
{
  "foods": [
    {
      "food_name": "Chicken breast",
      "quantity": 200,
      "unit": "g",
      "calories": 330,
      "protein": 62,
      "carbs": 0,
      "fat": 7.2,
      "fiber": 0,
      "sugar": 0,
      "sodium": 150
    },
    // ... more foods
  ],
  "confidence": 0.95,
  "ai_model_used": "gemini-flash"
}
```

**Analyze Image Request:**
```
Content-Type: multipart/form-data
image: [file] (JPEG, PNG, WebP, max 10MB)
```

### Daily Logs (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/daily-logs/dashboard?date=YYYY-MM-DD` | Complete dashboard data |
| GET | `/daily-logs/weekly` | 7-day summary |
| GET | `/daily-logs/monthly?year=2025&month=1` | Monthly statistics |

**Dashboard Response:**
```json
{
  "date": "2025-01-15",
  "caloriesConsumed": 1800,
  "caloriesBurned": 400,
  "calorieGoal": 2000,
  "netCalories": 1400,
  "progress": 70,
  "macros": {
    "protein": 120,
    "carbs": 180,
    "fat": 60
  },
  "recentFoods": [...],
  "activitySummary": {...}
}
```

### Activity Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activity/sync` | Sync activity data from health apps |
| POST | `/activity/manual` | Manually log activity |
| GET | `/activity/summary?date=YYYY-MM-DD` | Get activity summary |
| GET | `/activity/preferences` | Get user preferences |
| PUT | `/activity/preferences` | Update preferences |
| GET | `/activity/sources?platform=ios` | Get available sources for platform |

**Manual Activity Request:**
```json
{
  "activity_type": "Running",
  "duration": 1800,
  "calories_burned": 300,
  "steps": 5000,
  "distance": 4000,
  "notes": "Morning run"
}
```

### Users (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PUT | `/users/profile` | Update profile (recalculates calorie goal) |

---

## Testing

### Backend Testing

**Framework:** Jest + ts-jest

**Test files:** `*.spec.ts` in `src/` directory (currently none implemented)

**Commands:**
```bash
cd apps/backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

**Jest configuration** (in `apps/backend/package.json`):
- Test regex: `.*\.spec\.ts$`
- Root dir: `src`
- Transform: `ts-jest`
- Environment: `node`

**E2E configuration:** `test/jest-e2e.json`

### Mobile Testing

Testing infrastructure ready but no tests currently implemented.

### CI/CD

**Workflows** (`.github/workflows/`):

1. **ci.yml** - Basic validation
   - Dependency installation
   - Project structure check
   - Security audit
   - File validation

2. **pr-checks.yml** - Pull request validation
   - Linting (`npm run lint`)
   - Type checking (`npm run type-check`)
   - Build verification

3. **minimal.yml** - Minimal validation workflow

---

## Common Development Tasks

### Adding a New Backend Module

1. **Generate with NestJS CLI:**
   ```bash
   cd apps/backend
   nest g module feature-name
   nest g controller feature-name
   nest g service feature-name
   ```

2. **Follow module pattern:**
   ```
   src/feature-name/
   ├── feature-name.module.ts
   ├── feature-name.controller.ts
   ├── feature-name.service.ts
   ├── dto/
   │   └── create-feature.dto.ts
   └── interfaces/
       └── feature.interface.ts
   ```

3. **Register in `AppModule`** if not auto-imported

### Adding a New Mobile Screen

1. **Create screen directory:**
   ```
   apps/mobile/src/screens/NewFeature/
   ├── NewFeatureScreen.tsx
   ├── styles.ts
   └── types.ts
   ```

2. **Add to navigation** (`src/components/AppNavigation/AppNavigation.tsx`)

3. **Create custom hook** if data fetching required (`src/hooks/useNewFeature.ts`)

### Database Changes

1. **Update Supabase schema** via Supabase dashboard or SQL editor
2. **Update TypeScript interfaces** in:
   - Backend: `/apps/backend/src/common/interfaces/`
   - Mobile: `/apps/mobile/src/types/`
3. **Update DTOs** if API contracts change
4. **Test with Postman/Insomnia** before frontend integration

### Adding Environment Variables

1. **Add to `.env.example`** with placeholder
2. **Add to `.env`** with actual value
3. **Add to TypeScript config** if type-checking needed:
   - Backend: `apps/backend/src/main.ts` (validate on startup)
   - Mobile: Update API client or relevant service

### Debugging

**Backend:**
```bash
cd apps/backend
npm run start:debug  # Debug mode on port 9229
# Connect with Chrome DevTools or VS Code debugger
```

**Mobile:**
```bash
cd apps/mobile
npm start
# Open React Native Debugger or use Expo DevTools
```

**Common issues:**
- **CORS errors:** Check `ALLOWED_ORIGINS` in `.env`
- **401 Unauthorized:** Verify JWT token is valid and not expired
- **Rate limit exceeded:** Wait for throttle window to reset
- **Supabase errors:** Verify credentials and table permissions

---

## Important Conventions for AI Assistants

### When Making Changes

1. **Always read files before editing** - Never propose changes to code you haven't read
2. **Use Edit tool for existing files** - Never use Write unless creating new files
3. **Follow existing patterns** - Match the style and structure of surrounding code
4. **Respect TypeScript types** - Update interfaces when changing data structures
5. **Test locally** - Verify changes work with `npm run dev` before committing
6. **Update both apps** - If changing shared types, update backend AND mobile

### Code Quality Checklist

Before completing a task:
- [ ] Code follows naming conventions
- [ ] TypeScript types are correct
- [ ] No ESLint warnings introduced
- [ ] Imports are ordered correctly
- [ ] Security vulnerabilities avoided (XSS, SQL injection, etc.)
- [ ] Error handling is comprehensive
- [ ] Rate limiting considered for new endpoints
- [ ] Authentication required for protected routes
- [ ] React Query cache invalidation handled

### Security Best Practices

- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Use class-validator DTOs on backend
- **Sanitize user content** - Prevent XSS attacks
- **Use parameterized queries** - Supabase client handles this
- **Check authentication** - Use `@UseGuards(JwtAuthGuard)` on protected routes
- **Implement rate limiting** - Use `@Throttle()` decorator for sensitive endpoints
- **HTTPS only in production** - Configure in environment

### Common Pitfalls to Avoid

1. **Don't hardcode API URLs** - Use environment variables
2. **Don't bypass TypeScript** - Avoid `any` types
3. **Don't skip validation** - Always validate user input
4. **Don't forget error handling** - Use try-catch and proper HTTP status codes
5. **Don't ignore linting** - Fix warnings before committing
6. **Don't break backwards compatibility** - Consider mobile app when changing API
7. **Don't skip token refresh** - Mobile app handles this automatically
8. **Don't duplicate enums** - Share types between backend and mobile

### Git Workflow

This project uses feature branches:

**Current branch:** `claude/claude-md-mic8yqh32b69fwo0-01SeNeu4mhrjMkdSsVriMM5P`

**Commit message format:**
```
<type>: <description>

Examples:
feat: add weekly activity summary endpoint
fix: resolve token refresh loop in mobile app
refactor: extract calorie calculation to utility
docs: update CLAUDE.md with new patterns
test: add unit tests for AiService
```

**Before pushing:**
```bash
npm run format        # Format code
npm run lint          # Check for issues
git status            # Review changes
git add .
git commit -m "feat: descriptive message"
git push -u origin <branch-name>
```

---

## Known Limitations

1. **Health app integrations** - Currently stubs, actual integrations not implemented
2. **Tests** - Testing infrastructure ready but no spec files written
3. **Migrations** - Database schema managed manually via Supabase dashboard
4. **Image optimization** - 10MB limit may be high for mobile uploads
5. **Offline support** - No offline queue for failed API requests
6. **Real-time updates** - Dashboard relies on polling, not WebSockets

---

## Useful Resources

**Project Documentation:**
- README.md - Quick start guide
- .env.example - Environment configuration reference

**Backend:**
- [NestJS Documentation](https://docs.nestjs.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Google Generative AI](https://ai.google.dev/docs)

**Mobile:**
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Navigation](https://reactnavigation.org/)

**Development:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

## Last Updated

**Date:** 2025-01-23
**Codebase Version:** Based on commit `f1865b9` (migrate to react-query)

This document should be updated whenever significant architectural changes occur.

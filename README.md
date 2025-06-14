# 🍎 Calorie Tracker/Calculator

AI-powered calorie tracking application with image recognition and nutritional
analysis.

## 🎯 Features

- **AI Food Analysis**: Analyze food from text descriptions or photos
- **Smart Calorie Calculation**: Automatic macro and micronutrient estimation
- **Daily Dashboard**: Track calories, macros, and progress
- **User Profiles**: Personalized calorie goals based on user data
- **Cross-Platform**: React Native mobile app

## 🏗️ Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Mobile**: React Native + Expo
- **AI**: Google Gemini Flash
- **Auth**: Supabase Auth + JWT
- **Deployment**: Vercel + Docker

## 📁 Project Structure

```
calorie-tracker/
├── apps/
│   ├── backend/          # NestJS API server
│   └── mobile/           # React Native app
├── shared/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
├── docker/              # Docker configurations
├── scripts/             # Development scripts
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Docker (optional)
- Expo CLI (for mobile development)

### Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/yourusername/calorie-tracker.git
   cd calorie-tracker
   npm run setup
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Fill in your API keys and database URLs
   ```

3. **Start development**

   ```bash
   # Backend only
   npm run backend:dev

   # Mobile only
   npm run mobile:dev

   # Both together
   npm run dev
   ```

## 🔧 Development

### Backend Development

```bash
cd apps/backend
npm run start:dev    # Development server
npm run test        # Run tests
npm run build       # Build for production
```

### Mobile Development

```bash
cd apps/mobile
npm start           # Start Expo
npm run ios         # iOS simulator
npm run android     # Android emulator
```

## Environment Variables

Required variables in `.env`:

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Configuration (REQUIRED)
JWT_SECRET=your_secure_secret_32_chars_min
JWT_EXPIRES_IN=7d

# Google AI (REQUIRED)
GOOGLE_AI_API_KEY=your_google_ai_key

# Application
NODE_ENV=development
PORT=3000

# Security Settings
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
HELMET_ENABLED=true

# Optional
API_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:19006,http://localhost:3000
```

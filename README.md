# 🍎 Calorie Tracker

AI-powered calorie tracking application with image recognition and nutritional analysis.

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

## 📱 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Food Analysis
- `POST /food/analyze/text` - Analyze food from text
- `POST /food/analyze/image` - Analyze food from image
- `GET /food/entries` - Get user's food entries

### Dashboard
- `GET /daily-logs/dashboard` - Get daily dashboard data
- `GET /daily-logs/weekly` - Get weekly logs

## 🌍 Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# App
NODE_ENV=development
PORT=3000
```

## 🐳 Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

## 📊 Database Schema

The app uses Supabase with the following main tables:
- `users` - User profiles and settings
- `daily_logs` - Daily calorie and activity logs
- `food_entries` - Individual food entries with nutrition data
- `activity_entries` - Physical activity logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Backend Documentation](./apps/backend/README.md)
- [Mobile App Documentation](./apps/mobile/README.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
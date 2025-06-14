<p align="center">
  <a href="https://expo.dev/" target="blank"><img src="https://docs.expo.dev/static/images/expo-icon.png" width="120" alt="Expo Logo" /></a>
</p>

<p align="center">
  <a href="https://reactnative.dev/" target="blank"><img src="https://reactnative.dev/img/header_logo.svg" width="120" alt="React Native Logo" /></a>
</p>

## Description

Calorie AI Tracker/Calculator React Native mobile application built with Expo

## Project setup

```bash
$ npm install
```

## Development server

```bash
# Start Expo development server
$ npm start

# Start with cleared cache
$ npm start -- --clear

# Start tunnel connection (for testing on physical devices)
$ npm start -- --tunnel
```

## Run on devices

```bash
# iOS Simulator (macOS only)
$ npm run ios

# Android Emulator
$ npm run android

# Web browser (for testing)
$ npm run web
```

## Build and deploy

```bash
# Create development build
$ npx expo build:ios
$ npx expo build:android

# Create production build
$ npx expo build:ios --release-channel production
$ npx expo build:android --release-channel production

# Preview build
$ npx expo install --fix
$ npx expo start --no-dev --minify
```

## Environment setup

```bash
# Copy environment example
$ cp .env.example .env.local

# Fill in your API endpoint
API_URL=http://localhost:3000/api
```

## Testing

```bash
# Run tests
$ npm test

# Run tests in watch mode
$ npm run test:watch

# Run tests with coverage
$ npm run test:coverage
```

## Code quality

```bash
# Run ESLint
$ npm run lint

# Fix ESLint issues
$ npm run lint:fix

# Format code with Prettier
$ npm run format
```

## Expo CLI Commands

```bash
# Install Expo CLI globally
$ npm install -g @expo/cli

# Login to Expo
$ npx expo login

# Check project status
$ npx expo doctor

# Clear cache
$ npx expo r -c
```

## Features

- 📱 **Cross-platform** - iOS, Android, and Web
- 🎨 **Modern UI** - Clean and intuitive design
- 📸 **Camera Integration** - Take photos of food for analysis
- 🔐 **Authentication** - Secure user login and registration
- 📊 **Real-time Data** - Live calorie tracking and progress
- 🔄 **Offline Support** - Works without internet connection
- 🌙 **Dark Mode** - System-based theme switching

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Context API / Redux Toolkit
- **UI Components**: React Native Elements / NativeBase
- **Authentication**: Expo AuthSession
- **Camera**: Expo Camera
- **Networking**: Axios
- **Storage**: AsyncStorage / Expo SecureStore

## Folder Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API services and utilities
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── utils/             # Helper functions
├── constants/         # App constants
└── types/             # TypeScript type definitions
```

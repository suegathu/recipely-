# Recipely

A recipe discovery app built with Expo (React Native) and Material Design 3, backed by [TheMealDB](https://www.themealdb.com/api.php). Browse categories, view recipes, search by title/cuisine/ingredient, and bookmark favorites — all with offline caching via SQLite.

## Tech Stack

- [Expo](https://expo.dev) (SDK 56) + TypeScript
- [React Navigation](https://reactnavigation.org/) (bottom tabs + native stack)
- [React Native Paper](https://callstack.github.io/react-native-paper/) (MD3 theming)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [drizzle-orm](https://orm.drizzle.team/) for offline-first local storage
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) for image loading
- [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo) + [zustand](https://github.com/pmndrs/zustand) for network status

## Getting Started

```bash
npm install
npx expo start
```

Open the project in [Expo Go](https://expo.dev/go) on your device by scanning the QR code, or run on a simulator/emulator:

```bash
npx expo start --ios
npx expo start --android
```

## Project Structure

```
src/
  theme/        # MD3 color palettes + Paper/Navigation theme providers
  navigation/    # Bottom tab + root stack navigators
  data/
    db/          # SQLite schema + drizzle client
    api/         # TheMealDB API client + DTO mappers
    repositories/ # Offline-first data access (cache-or-fetch)
  store/         # Zustand stores (network status)
  components/    # Shared UI components
  features/      # Screens grouped by feature (home, recipes, search, bookmarks, etc.)
```

## Current Features

- Home: featured "Recipe of the Day", random recipe shortcut, category grid
- Category recipes grid
- Recipe detail with ingredients, instructions, and bookmarking
- Search with title/cuisine/ingredient filters
- Bookmarks list
- Offline support via local SQLite cache + network status banner

## Roadmap

- Authentication
- AI-assisted recipe chat
- Food journal / document tracking
- Background sync
- Light/dark theme switcher

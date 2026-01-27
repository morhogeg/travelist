# Travelist

iOS travel recommendation app built with React + Capacitor.

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for iOS development
npm run ios:dev

# Build for iOS production
npm run ios:prod
```

## iOS Builds

```bash
# Sync web assets to iOS
npm run cap:sync

# Open in Xcode
npm run cap:open
```

## Documentation

See `/guides` folder for detailed documentation:
- [CONTEXT.md](/guides/CONTEXT.md) - Project overview and architecture
- [APP_STORE_DEPLOYMENT.md](/guides/APP_STORE_DEPLOYMENT.md) - TestFlight & App Store guide
- [IOS_DEVELOPMENT.md](/guides/IOS_DEVELOPMENT.md) - iOS development guide
- [UI_UX_PATTERNS.md](/guides/UI_UX_PATTERNS.md) - Design patterns

## Tech Stack

- React 18 + TypeScript
- Vite
- Capacitor 7 (iOS native)
- Tailwind CSS + shadcn/ui
- Supabase (backend)
- OpenRouter AI (recommendations parsing)
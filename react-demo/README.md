# OpenGameSDK React Demo

A simple React application demonstrating the integration of OpenGameSDK for game points management.

## Features

- Points tracking and management
- Real-time points updates
- Points saving functionality
- Integration with OpenGameSDK's points widget
- Claim rewards through OpenGameProtocol 

## Prerequisites

- Node.js (v14 or higher)
- npm or pnpm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Start the development server:
   ```bash
   npm start
   # or
   pnpm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## SDK Integration

The demo showcases the following OpenGameSDK features:

- SDK initialization with points widget enabled
- Points management through `addPoints` and `savePoints` methods
- Type-safe integration using TypeScript and SDK types
- Error handling for points saving operations

## Code Example

```typescript
import OpenGameSDK, { SDKOpts } from "@opusgamelabs/game-sdk";

// Initialize SDK with points widget
const sdk = new OpenGameSDK({ 
  ui: { 
    usePointsWidget: true 
  }
} as SDKOpts);

// Initialize game with your game ID
await sdk.init({ 
  gameId: 'your-game-id'
});

// Add points
sdk.addPoints(1);

// Save points
await sdk.savePoints(points);
```

## Project Structure

- `src/App.tsx` - Main application component with SDK integration
- `src/App.css` - Application styles
- `public/` - Static assets

## Available Scripts

- `npm start` - Runs the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build

## License

MIT

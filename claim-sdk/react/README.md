# @opusgamelabs/claim-react

React components for Open Game Protocol rewards system.

## Installation

```bash
npm install @opusgamelabs/claim-react
```

## Usage

### 1. Import the Styles

**IMPORTANT:** You must import the CSS file in your application for the components to be styled correctly.

Add this import at the top level of your application (e.g., in your main `App.tsx` or `index.tsx`):

```tsx
import "@opusgamelabs/claim-react/styles.css";
```

### 2. Use the OGPClaimProvider

```tsx
import { OGPClaimProvider, OGPClaimButton } from "@opusgamelabs/claim-react";

function App() {
  return <OGPClaimProvider>{children}</OGPClaimProvider>;
}
```

## Styling

This package includes:

- **Tailwind CSS** - All Tailwind utility classes used by the components
- **Custom Theme** - Pre-configured color palette, fonts, and animations
- **Custom Fonts** - PPNeueMontreal font family (Regular, Medium, Bold)
- **Dark Mode Support** - Automatic dark mode styling with the `dark` class

### Theme Colors

The package includes a comprehensive color system:

**Light Mode:**

- Background: `bg-site-light-background`
- Panel: `bg-site-light-panel`
- Text: `text-site-light-text-primary`, `text-site-light-text-secondary`
- Accent: `text-site-light-accent-blue`, `text-site-light-accent-green`

**Dark Mode:**

- Background: `bg-site-dark-background`
- Panel: `bg-site-dark-panel`
- Text: `text-site-dark-text-primary`, `text-site-dark-text-secondary`
- Accent: `text-site-dark-accent-blue`, `text-site-dark-accent-green`

### Custom Fonts

The package includes the PPNeueMontreal font family:

- `font-neue` - Regular weight
- `font-neue-medium` - Medium weight
- `font-neue-bold` - Bold weight

### Animations

Pre-configured animations:

- `animate-slide-up` - Slide up with fade in
- `animate-slide-down` - Slide down with fade out
- `animate-fade-in` - Fade in
- `animate-fade-out` - Fade out

## API Reference

### Components

- `OGPClaimProvider` - Context provider for claim functionality
- `OGPClaimButton` - Pre-built claim button component
- `OGPClaimModal` - Modal component for claims
- `ClaimModal` - Pre-built claim modal screen
- `LoginModal` - Pre-built login modal screen
- `LoadingModal` - Pre-built loading modal screen
- `NoRewardsModal` - Pre-built no rewards modal screen

### Hooks

- `useOGPClaim` - Access claim context and state
- `useClaimRewards` - Hook for claiming rewards
- `usePlayerRewards` - Hook for fetching player rewards

### Types

See the TypeScript definitions for complete type information.

## Development

### Building

```bash
npm run build
```

This will:

1. Compile CSS with Tailwind (minified)
2. Compile TypeScript to JavaScript
3. Copy font files to dist

### Cleaning

```bash
npm run clean
```

## License

See LICENSE.md

# OGP Demos

This repository contains demonstration projects showing how to use the Open Game Protocol (OGP) SDK and endpoints. These demos help developers understand how to integrate OGP into their games to enable token rewards and player authentication.

## Getting Started with OGP

Before using these demos, you'll need to register as a game developer:

1. **Register as a Game Developer**: Visit the [Pre-release Onboarding App](https://onboarding.opengameprotocol.com/) and create an account
2. **Get Your API Keys**: You'll receive a Public API Key and Secret for server-side requests
3. **Add Developer Ownership**: Add the meta tag to your game's HTML entry point:
   ```html
   <meta name="x-ogp-key" content="YOUR_API_KEY" />
   ```
4. **Verify Ownership**: Return to the onboarding app and claim ownership of your game

For detailed onboarding instructions, visit the [Game Developer Onboarding Guide](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/game-developer-onboarding).

## Demo Projects

Each demo project is contained in its own subfolder with complete implementation examples.

### Simple Game Demo (`simple-game/`)

This demo shows how to:

- Initialize and configure the OpenGameSDK
- Track player points in real-time using `addPoints()`
- Save final scores using `savePoints()`
- Handle SDK events (`OnReady`, `OnSessionStarted`)

### React Demo (`react-demo/`)

This demo shows how to:

- Initialize and configure the OpenGameSDK in a React application
- Track player points in real-time using `addPoints()`
- Save final scores using `savePoints()`
- Handle SDK events (`OnReady`)
- Implement SDK functionality with React hooks and state management

### Claim SDK Demo (`claim-sdk/`)

The Claim SDK can be implemented in 2 different ways.

If you are building a website in React, you can use the `@opusgamelabs/claim-react` package and follow the [React Demo](https://github.com/OpusGameLabs/ogp-demos/tree/main/claim-sdk/react) instructions.

If you are building a website in vanilla JS, you can use the standalone button implementation in the [Vanilla JS Demo](https://github.com/OpusGameLabs/ogp-demos/tree/main/claim-sdk/vanilla-js) instructions.

The Vanilla JS implementation uses a standalone `ogp-claim-button` script that you can include in your project. This script will load an invisible iFrame widget that will trigger when users click the claim button.

### Game Registration Demo (`game-registration/`)

This demo shows how to:

- Use the OGP game registration endpoint
- Integrate the OGP Token Selector widget

## Resources

- **SDK Documentation**: [Open Game SDK](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-sdk) - For authentication, score tracking, and player rewards
- **API Endpoints**: [Open Game Endpoints](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-endpoints) - Advanced integration documentation

# OGP Demos

This repository contains demonstration projects showing how to use the Open Game Protocol (OGP) SDK and endpoints. These demos help developers understand how to integrate OGP into their games to enable token rewards and player authentication.

## Getting Started with OGP

Before using these demos, you'll need to register as a game developer:

1. **Register as a Game Developer**: Visit the [Pre-release Onboarding App](https://onboarding.opengameprotocol.com/) and create an account
2. **Get Your API Keys**: You'll receive a Public API Key and Secret for server-side requests
3. **Add Developer Ownership**: Add the meta tag to your game's HTML entry point:
   ```html
   <meta name="x-ogp-key" content="YOUR_API_KEY">
   ```
4. **Verify Ownership**: Return to the onboarding app and claim ownership of your game

For detailed onboarding instructions, visit the [Game Developer Onboarding Guide](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/game-developer-onboarding).

## Demo Projects

Each demo project is contained in its own subfolder with complete implementation examples.

### 1. Game Registration Demo (`game-registration/`)

This demo shows how to:
- Use the OGP game registration endpoint
- Integrate the OGP Token Selector widget

## Resources

- **SDK Documentation**: [Open Game SDK](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-sdk) - For authentication, score tracking, and player rewards
- **API Endpoints**: [Open Game Endpoints](https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-endpoints) - Advanced integration documentation

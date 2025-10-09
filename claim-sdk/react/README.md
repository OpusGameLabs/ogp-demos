# @opusgamelabs/claim-react Demo

This is a demo of the `@opusgamelabs/claim-react` package.

## Running the Demo

To run the demo, you'll need to have Node.js installed on your machine.

1. Install dependencies with `pnpm install`
2. Run the development server with `pnpm dev`
3. Open your browser to `http://localhost:3000`

## Using the package in your own project

To use the package in your own project, you'll need to install it using your preferred package manager.

```bash
npm install @opusgamelabs/claim-react
```

Then, you can import styles and components from the package.

## Importing Styles

**IMPORTANT:** You must import the CSS file in your application for the components to be styled correctly.

Add this import at the top level of your `global.css`:

```tsx
import "@opusgamelabs/claim-react/styles.css";
```

**Note:** The styles are scoped to avoid conflicts with your application's styles. All Tailwind utilities use the `ogp-` prefix, and font declarations are scoped within the component wrapper. This ensures the package won't override your existing Tailwind configuration or custom styles.

## Authentication

To use the authentication flow, simply wrap your app in `<OGPClaimProvider>` and use either the `<OGPClaimButton>` or `useOGPClaim` hook to interact with the SDK.

```tsx
import { OGPClaimProvider } from "@opusgamelabs/claim-react";

function App() {
  return <OGPClaimProvider>{children}</OGPClaimProvider>;
}
```

## Usage

Once you've wrapped your app in the `<OGPClaimProvider>`, you can use either the `<OGPClaimButton>` or `useOGPClaim` hook to interact with the SDK.

### `<OGPClaimButton>`

The `<OGPClaimButton>` component is a button that triggers the claim flow.

```tsx
import { OGPClaimButton } from "@opusgamelabs/claim-react";

const ClaimButton = () => {
  const { isAuthenticated, login } = useOGPClaim();

  return (
    <OGPClaimButton>
      {isAuthenticated ? "Claim Your Rewards" : "Login to Claim Rewards"}
    </OGPClaimButton>
  );
};
```

### `useOGPClaim`

The `useOGPClaim` hook returns:

```ts
type OGPClaimContextType = {
  playerRewards?: PlayerRewards;
  isAuthenticated: boolean;
  isClaiming: boolean;
  isLoadingRewards: boolean;
  modalState: ModalState;
  playerId: string | null;
  login: () => Promise<void>;
  showModal: (type: ModalState["type"], data?: any) => void;
  hideModal: () => void;
  startClaim: () => Promise<void>;
  createClaimTransactions: (
    tokenAddresses: string[]
  ) => Promise<TransactionWithAddress[] | null>;
  submitClaimTransactions: (
    tokenAddresses: string[]
  ) => Promise<SubmitTransactionsResult>;
  refreshPlayerRewards: () => Promise<void>;
};
```

Properties:

- `playerRewards`: The current player's rewards, if the user is authenticated.
- `isAuthenticated`: A boolean indicating whether the user is authenticated.
- `isClaiming`: A boolean indicating whether the user is currently claiming rewards.
- `isLoadingRewards`: A boolean indicating whether the user is currently loading rewards.
- `modalState`: The current modal state.
- `playerId`: The current player's ID (from OGP Privy)

Functions:

- `login`: Trigger privy login flow.
- `showModal`: Shows a modal with the specified type and data.
- `hideModal`: Hides the current active modal.
- `startClaim`: Starts the claim flow.
- `createClaimTransactions`: Creates the claim transactions for the specified gToken addresses.
- `submitClaimTransactions`: Submits the claim transactions. `displayPrivyUi` is a boolean indicating whether to display the Privy UI or not.
- `refreshPlayerRewards`: Refreshes the player's rewards.

## Example Usage

Here's how you can use the `useOGPClaim` hook to create a claim flow, assuming you are not using a custom auth provider:

```tsx
import { useOGPClaim } from "@opusgamelabs/claim-react";

const ClaimButton = () => {
  const { isAuthenticated, startClaim, login } = useOGPClaim();

  return (
    <button
      className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
      onClick={() => {
        isAuthenticated ? startClaim() : login();
      }}
    >
      {isAuthenticated ? "Claim Your Rewards" : "Login to Claim Rewards"}
    </button>
  );
};
```

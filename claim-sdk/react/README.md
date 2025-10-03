# @opusgamelabs/claim-react Demo

This is a demo of the `@opusgamelabs/claim-react` package.

## Running the Demo

To run the demo, you'll need to have Node.js installed on your machine.

1. Install dependencies with `pnpm install`
2. Run the development server with `pnpm dev`
3. Open your browser to `http://localhost:3000`

## Authentication

We support using our default authentication flow using our built-in Privy integration, or you can use your own authentication flow by using a custom auth provider.

### Default Auth

To use the default authentication flow, simply wrap your app in `<OGPClaimProvider>` and use either the `<OGPClaimButton>` or `useOGPClaim` hook to interact with the SDK.

```tsx
import { OGPClaimProvider } from "@opusgamelabs/claim-react";

function App() {
  return <OGPClaimProvider>{children}</OGPClaimProvider>;
}
```

### Custom Auth

To use a custom authentication flow, you'll need to use a custom auth provider. You will need to implement the following hook:

```tsx
const { getToken, isLoading, isAuthenticated } = useAuth();
```

The `getToken` function should return a promise that resolves to either a string with the access token of the user, or undefined if the user is not authenticated.

The `isLoading` boolean should be true if the user is authenticating, and false if the user is not authenticating.

The `isAuthenticated` boolean should be true if the user is authenticated, and false if the user is not authenticated.

You can then pass this custom auth provider to the `customAuthConfig` prop of the `<OGPClaimProvider>`.

**Important:** The `<OGPClaimProvider>` MUST be a child of your custom auth provider component.

```tsx
import { OGPClaimProvider } from "@opusgamelabs/claim-react";

function App() {
  return (
    <MyCustomAuthProvider>
      <OGPClaimProvider
        config={{
          useCustomAuth: true,
          customAuthConfig: {
            useAuthHook: useCustomAuth,
          },
        }}
      >
        {children}
      </OGPClaimProvider>
    </MyCustomAuthProvider>
  );
}
```

## Usage

Once you've wrapped your app in the `<OGPClaimProvider>`, you can use either the `<OGPClaimButton>` or `useOGPClaim` hook to interact with the SDK.

### `<OGPClaimButton>`

The `<OGPClaimButton>` component is a button that triggers the claim flow.

```tsx
import { OGPClaimButton } from "@opusgamelabs/claim-react";

const ClaimButton = () => {
  const { isAuthenticated } = useOGPClaim();

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
  showModal: (type: ModalState["type"], data?: any) => void;
  hideModal: () => void;
  startClaim: () => Promise<void>;
  createClaimTransactions: (
    gTokenAddresses: string[]
  ) => Promise<TransactionWithAddress[] | null>;
  submitClaimTransactions: (
    transactions: TransactionWithAddress[],
    displayPrivyUi?: boolean
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

Functions:

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
  const { login } = useAuth();
  const { isAuthenticated, startClaim } = useOGPClaim();

  return (
    <button
      className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
      onClick={() => startClaim()}
    >
      {isAuthenticated ? "Claim Your Rewards" : "Login to Claim Rewards"}
    </button>
  );
};
```

If you are using a custom auth provider, you can still use the `useOGPClaim` hook, you'll just want to make sure you are logged in with your custom auth provider before calling `startClaim`.

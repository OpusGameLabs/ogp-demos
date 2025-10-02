# OGP Claim Widget - Vanilla JS

This is a standalone button implementation of the OGP Claim Widget for use in vanilla JS projects.

This will allow you to create a button that triggers the claim flow using our iFrame'd widgets. This is useful for projects that don't use React or other frameworks.

## Implementation

Add the script and create buttons with `data-ogp-claim-button`:

```html
<script src="./ogp-claim-button-new.js"></script>

<button data-ogp-claim-button="my-btn">Claim Rewards</button>
```

## Configuration

You can configure the widget by setting the `OGPClaimButton.setIcon` function:

```js
OGPClaimButton.setIcon(
  "https://cdn.opengameprotocol.com/images/staging/86d7ff70-431e-46ba-b820-b9dd20e7760a/35f68cd2-a0f2-42b8-b6d9-4f1fded409e3-1756838762278-sc84fekub.png"
);
```

## Demo

Check out the [demo](https://max-web.github.io/ogp-demos/claim-sdk/vanilla-js/) to see the standalone button in action.

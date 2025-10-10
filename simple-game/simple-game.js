// =============================================================================
// OGP SIMPLE GAME DEMO - CLICK COUNTER GAME
// =============================================================================
//
// This is a simple demonstration of the OpenGameSDK integration for a basic
// click counter game. The game allows players to:
// - Click "Add Point" to increment their score
// - Click "End Game" to save their score to the OGP platform
//
// For full OpenGameSDK documentation, refer to:
// https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og
//
// For game registration and API keys, visit:
// https://onboarding.opengameprotocol.com/
//
// =============================================================================
// CONFIGURATION
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Placeholder values - replace with actual values in production
  const gameId = "placeholder-game-id"; // Replace with your registered game ID.
  const playerId = "placeholder-player-id"; // Replace with actual player ID. Note, this is an optional parameter.

  console.log("Simple Game Demo - Initializing...");

  // SDK is already loaded via script tag in HTML, initialize directly
  console.log("✅ OpenGameSDK loaded via HTML script tag");
  initializeGame();

  // =============================================================================
  // SDK INITIALIZATION
  // =============================================================================

  /**
   * Initializes the OpenGameSDK with configuration and sets up the game
   * This function configures the SDK, marks the game as ready, and initializes
   * the game session with the provided game and player data.
   */
  function initializeGame() {
    // SDK configuration options
    const sdkConfig = {
      ui: {
        usePointsWidget: true, // Enable the built-in points widget
      },
      logLevel: 1, // Set logging level (0=none, 1=errors, 2=warnings, 3=info)
    };

    // Create new OpenGameSDK instance
    const ogp = new OpenGameSDK(sdkConfig);

    // Initialize with game and player data
    const initData = {
      gameId: gameId, // Your registered game ID from OGP platform
      playerId: playerId, // Unique identifier for the current player
    };

    console.log("Initializing SDK with:", initData);
    ogp.init(initData);

    // Set up the game UI and logic
    setupGameLogic(ogp);
  }

  // =============================================================================
  // GAME LOGIC & UI MANAGEMENT
  // =============================================================================

  /**
   * Sets up the game logic, UI event handlers, and SDK event listeners
   * This function manages the core game mechanics including:
   * - Point adding functionality
   * - Game ending logic
   * - SDK event handling
   * - UI state management
   * @param {OpenGameSDK} ogp - The initialized OpenGameSDK instance
   */
  function setupGameLogic(ogp) {
    // =============================================================================
    // DOM ELEMENTS
    // =============================================================================

    const counterElement = document.getElementById("counter");
    const addPointButton = document.getElementById("addPointButton");
    const endGameButton = document.getElementById("endGameButton");

    // =============================================================================
    // GAME STATE VARIABLES
    // =============================================================================

    let counter = 0; // Current player score
    let gameEnded = false; // Flag to prevent actions after game ends

    // =============================================================================
    // GAME EVENT HANDLERS
    // =============================================================================

    /**
     * Handles add point button clicks
     * Increments the counter and reports points to the SDK
     */
    addPointButton.addEventListener("click", () => {
      if (gameEnded) return;

      const pointsPerClick = 1;
      counter += pointsPerClick;
      counterElement.textContent = counter;

      // Report points to the SDK - this tracks points in real-time
      ogp.addPoints(pointsPerClick);
    });

    /**
     * Handles end game button clicks
     * Triggers the game ending sequence
     */
    endGameButton.addEventListener("click", () => {
      if (gameEnded) return;

      onGameEnd();
    });

    /**
     * Handles the game ending sequence
     * Disables UI elements and saves the final score to the SDK
     */
    function onGameEnd() {
      gameEnded = true;

      // Disable buttons to prevent further interaction
      addPointButton.disabled = true;
      endGameButton.disabled = true;

      // Save the final score to the SDK - this commits the points to the platform
      ogp.savePoints(counter);
    }

    // =============================================================================
    // SDK EVENT HANDLERS
    // =============================================================================

    /**
     * Fired when the SDK is fully initialized and ready for use
     * This is when we can safely enable game interactions
     */
    ogp.on("OnReady", () => {
      console.log("🚀 OpenGameSDK is ready");

      // Enable buttons when SDK is ready
      addPointButton.disabled = false;
      endGameButton.disabled = false;
    });

    /**
     * Fired when a game session has been successfully started
     * This indicates the player can now earn points
     */
    ogp.on("OnSessionStarted", () => {
      console.log("🔗 Game session started");
    });

    console.log("Game logic initialized");
  }

  // =============================================================================
  // END OF GAME SETUP
  // =============================================================================
});

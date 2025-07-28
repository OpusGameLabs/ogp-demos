// =============================================================================
// OGP CLAIM CREATOR REWARDS DEMO
// =============================================================================
//
// This is a simple demonstration of the OpenGameSDK integration for claiming
// creator rewards. The demo allows creators to:
// - Click "Claim Creator Rewards" to claim their available rewards
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

document.addEventListener('DOMContentLoaded', () => {
  // Placeholder values - replace with actual values in production
  const playerId = 'placeholder-player-id';  // Replace with actual player ID. Note, this is an optional parameter.
  const gameId = 'your-game-id-here';        // Replace with your registered game ID.

  console.log('Claim Creator Rewards Demo - Initializing...');

  // SDK is already loaded via script tag in HTML, initialize directly
  console.log('✅ OpenGameSDK loaded via HTML script tag');
  initializeDemo();

  // =============================================================================
  // SDK INITIALIZATION
  // =============================================================================

  /**
   * Initializes the OpenGameSDK with configuration and sets up the demo
   * This function configures the SDK, marks the game as ready, and initializes
   * the session with the provided game and player data.
   */
  function initializeDemo() {
    // SDK configuration options
    const sdkConfig = {
      logLevel: 1,                // Set logging level (0=none, 1=errors, 2=warnings, 3=info)
    };

    // Create new OpenGameSDK instance
    const ogp = new OpenGameSDK(sdkConfig);

    // Initialize with game and player data
    const initData = {
      gameId: gameId,      // Your registered game ID from OGP platform
      playerId: playerId,  // Unique identifier for the current player
    };

    console.log('Initializing SDK with:', initData);
    ogp.init(initData);

    // Set up the demo UI and logic
    setupDemoLogic(ogp);

    // Mark game as ready to play - this tells the SDK the game is loaded
    ogp.gameReadyToPlay();
  }

  // =============================================================================
  // DEMO LOGIC & UI MANAGEMENT
  // =============================================================================

  /**
   * Sets up the demo logic, UI event handlers, and SDK event listeners
   * This function manages the core demo mechanics including:
   * - Claim creator rewards functionality
   * - SDK event handling
   * - UI state management
   * @param {OpenGameSDK} ogp - The initialized OpenGameSDK instance
   */
  function setupDemoLogic(ogp) {
    // =============================================================================
    // DOM ELEMENTS
    // =============================================================================
    
    const claimButton = document.getElementById('claimCreatorRewardsButton');

    // =============================================================================
    // DEMO EVENT HANDLERS
    // =============================================================================

    /**
     * Handles claim creator rewards button clicks
     * Calls the SDK to claim creator rewards
     */
    claimButton.addEventListener('click', async () => {
      console.log('>>> Claiming creator rewards...');
      
      // Disable button during the claim process
      claimButton.disabled = true;
      claimButton.textContent = 'Claiming...';
      
      try {
        // Call the SDK function to claim creator rewards
        const result = await ogp.claimCreatorRewards();
        console.log('>>> Creator rewards claimed successfully:', result);
        
        // Update button to show success
        claimButton.textContent = 'Rewards Claimed!';
        claimButton.style.backgroundColor = '#28a745';
      } catch (error) {
        console.error('>>> Error claiming creator rewards:', error);
        
        // Update button to show error
        claimButton.textContent = 'Claim Failed';
        claimButton.style.backgroundColor = '#dc3545';
      }
    });

    // =============================================================================
    // SDK EVENT HANDLERS
    // =============================================================================

    /**
     * Fired when the SDK is fully initialized and ready for use
     * This is when we can safely enable demo interactions
     */
    ogp.on('OnReady', () => {
      console.log('🚀 OpenGameSDK is ready');
      
      // Enable button when SDK is ready
      claimButton.disabled = false;
    });

    /**
     * Fired when a game session has been successfully started
     * This indicates the connection to the platform is established
     */
    ogp.on('OnSessionStarted', () => {
      console.log('🔗 Game session started');
    });

    console.log('Demo logic initialized');
  }
  
  // =============================================================================
  // END OF DEMO SETUP
  // =============================================================================
}); 
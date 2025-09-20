// =============================================================================
// OGP GAME REGISTRATION - DEMO FRONTEND CONFIGURATION
// =============================================================================
//
// ⚠️ IMPORTANT:
// This demo is intended for frontend-only use during development or testing.
// In a real production application, you should NOT expose your SECRET_KEY
// in client-side code, as it poses a significant security risk.
//
// Instead, API requests involving authentication (e.g., signature generation)
// should be routed through your own secure backend.
//
// For full integration details, refer to:
// https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-endpoints
//
// You can get pre-release keys at:
// https://onboarding.opengameprotocol.com/
const API_KEY = 'your-api-key-here';
const SECRET_KEY = 'your-secret-key-here';

// API endpoints - Documentation: https://docs.opengameprotocol.com/7Cx0vTSGe7N68FP9dlE8/build-on-og/open-game-endpoints
const ENDPOINT_BASE_URL = 'https://api.opengameprotocol.com';
const REGISTER_GAME_ENDPOINT = 'market/registerGame';

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Generates HMAC signature for API authentication
 * @returns {Promise<string>} The signature for API requests
 */
async function getSignature() {
  try {
    const response = await fetch(`${ENDPOINT_BASE_URL}/market/getSignature`, {
      method: 'POST',
      body: JSON.stringify({
        secretKey: SECRET_KEY,
        path: '/market/registerGame',
        method: 'post',
        apiKey: API_KEY,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get signature: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data.signature;
  } catch (error) {
    console.error('Failed to get signature:', error);
    throw new Error('Signature generation failed');
  }
}

/**
 * Registers a game with the OGP platform
 * @param {Object} gameData - Game registration data
 * @returns {Promise<Object>} Registration result with game API key
 */
async function registerGame(gameData) {
  const signature = await getSignature();

  if (
    !gameData.name
    || !gameData.image
    || !gameData.gameUrl
    || !gameData.isHTMLGame
    || !gameData.tokens || gameData.tokens.length === 0
  ) {
    throw new Error('Missing required fields');
  }

  const payload = {
    name: gameData.name,
    description: gameData.description || undefined,
    gameUrl: formatUrl(gameData.gameUrl),
    image: gameData.image,
    platform: 'web',
    isHTMLGame: gameData.isHTMLGame,
    tokens: gameData.tokens,
  };

  // Add optional fields if provided
  if (gameData.developers && gameData.developers.length > 0) {
    payload.developers = gameData.developers;
  }
  if (gameData.coverImage) {
    payload.coverImage = gameData.coverImage;
  }
  if (gameData.twitter) {
    payload.twitter = formatUrl(gameData.twitter, 'https://twitter.com/');
  }
  if (gameData.discord) {
    payload.discord = formatUrl(gameData.discord, 'https://discord.gg/');
  }

  console.log('Submitting game registration:', payload);

  const response = await fetch(
    `${ENDPOINT_BASE_URL}/${REGISTER_GAME_ENDPOINT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-auth-provider': 'hmac',
        Authorization: signature,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Registration failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  console.log('Registration response:', result);

  if (result.data && result.data.gameApiKey) {
    return {
      success: true,
      game: { apiKey: result.data.gameApiKey },
      uploads: result.data.uploads || {},
    };
  } else {
    throw new Error('Registration failed: No gameApiKey returned.');
  }
}

/**
 * Formats URLs with proper protocol prefix
 * @param {string} url - URL to format
 * @param {string} prefix - Protocol prefix (default: 'https://')
 * @returns {string} Formatted URL
 */
function formatUrl(url, prefix = 'https://') {
  if (!url) return '';
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `${prefix}${cleanUrl}`;
}

// =============================================================================
// TOKEN SELECTOR WIDGET
// =============================================================================

// Initialize OGP Token Selector widget
// Include script in HTML: <script src="https://cdn.opengameprotocol.com/ogp-token-select-widget.js"></script>

let selectedTokens = [];

/**
 * Initializes the OGP Token Selector widget
 */
async function initializeTokenSelector() {
  try {
    const ogpWidget = await OGPTokenSelect({
      anchor: document.getElementById('token-selector-widget-container'),
      multiple: true,
      height: 46,
      logLevel: 3,
      theme: 'light',
      constrainDropdownHeight: false,
    });

    // Make widget visible after initialization
    const iframe = document.querySelector(
      '#token-selector-widget-container iframe'
    );
    if (iframe) {
      iframe.style.opacity = '1';
    }

    // Handle token selection changes
    ogpWidget.onTokensChange((selection) => {
      console.log('--- onTokensChange event fired ---');
      console.log('Received data object:', selection);
      if (selection && selection.tokenIdentifiers) {
        selectedTokens = selection.tokenIdentifiers;
      } else {
        selectedTokens = [];
      }
    });
  } catch (error) {
    console.error('Failed to initialize token selector widget:', error);
    const container = document.getElementById(
      'token-selector-widget-container'
    );
    if (container) {
      container.innerHTML =
        '<p style="color: red;">Error: Could not load token selector.</p>';
    }
  }
}

// Initialize token selector on page load
initializeTokenSelector();

// Handle widget dropdown open/close events
window.addEventListener('message', (event) => {
  // Note: In production, check event.origin for security
  const data = event.data;
  const iframe = document.querySelector(
    '#token-selector-widget-container iframe'
  );

  if (!iframe) return;

  if (data && data.type === 'ogp-widget-dropdown-open') {
    iframe.style.height = '450px';
  } else if (data && data.type === 'ogp-widget-dropdown-close') {
    iframe.style.height = '46px';
  }
});

// =============================================================================
// FORM ELEMENTS & STATE MANAGEMENT
// =============================================================================

// Form elements
const form = document.getElementById('gameRegistrationForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const responseMessage = document.getElementById('responseMessage');

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates required fields
 * @param {*} value - Field value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {string|null} Error message or null if valid
 */
function validateRequired(value, fieldName) {
  if (
    !value ||
    (typeof value === 'string' && value.trim() === '') ||
    (value instanceof FileList && value.length === 0)
  ) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {string|null} Error message or null if valid
 */
function validateUrl(url, fieldName) {
  if (!url) return null; // Optional field

  const cleanUrl = url.replace(/^https?:\/\//, '');

  // Flexible URL pattern for various formats
  const urlPattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/;

  if (!urlPattern.test(cleanUrl)) {
    return `Please enter a valid ${fieldName.toLowerCase()} (e.g., example.com or subdomain.example.com/path)`;
  }

  if (!cleanUrl.includes('.')) {
    return `Please enter a valid ${fieldName.toLowerCase()} with a domain (e.g., example.com)`;
  }

  return null;
}

/**
 * Validates Twitter username format
 * @param {string} username - Twitter username to validate
 * @returns {string|null} Error message or null if valid
 */
function validateTwitter(username) {
  if (!username) return null; // Optional field

  const twitterPattern = /^[a-zA-Z0-9_]{1,15}$/;
  if (!twitterPattern.test(username)) {
    return 'Please enter a valid Twitter username';
  }
  return null;
}

/**
 * Validates Discord invite code format
 * @param {string} inviteCode - Discord invite code to validate
 * @returns {string|null} Error message or null if valid
 */
function validateDiscord(inviteCode) {
  if (!inviteCode) return null; // Optional field

  const discordPattern = /^[a-zA-Z0-9-]{3,25}$/;
  if (!discordPattern.test(inviteCode)) {
    return 'Please enter a valid Discord invite code';
  }
  return null;
}

/**
 * Validates image file format and size
 * @param {File} file - File to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {string|null} Error message or null if valid
 */
function validateImageFile(file, fieldName) {
  if (!file) return null;

  const maxSize = 5 * 1024 * 1024; // 5MB limit
  if (file.size > maxSize) {
    return `${fieldName} must be less than 5MB`;
  }

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (!allowedTypes.includes(file.type)) {
    return `${fieldName} must be a valid image file (JPG, PNG, GIF, WEBP)`;
  }

  return null;
}

// =============================================================================
// FILE HANDLING FUNCTIONS
// =============================================================================

/**
 * Converts file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 encoded file data
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Shows image preview for uploaded file
 * @param {File} file - Image file to preview
 * @param {HTMLElement} previewElement - Preview element
 * @param {HTMLElement} containerElement - Container element
 */
function showImagePreview(file, previewElement, containerElement) {
  const reader = new FileReader();
  reader.onload = function (e) {
    previewElement.style.backgroundImage = `url(${e.target.result})`;
    previewElement.classList.add('show');
    containerElement.classList.add('has-file');
  };
  reader.readAsDataURL(file);
}

/**
 * Clears image preview
 * @param {HTMLElement} previewElement - Preview element to clear
 * @param {HTMLElement} containerElement - Container element
 */
function clearImagePreview(previewElement, containerElement) {
  previewElement.style.backgroundImage = '';
  previewElement.classList.remove('show');
  containerElement.classList.remove('has-file');
}

// =============================================================================
// UI STATE MANAGEMENT
// =============================================================================

/**
 * Shows error state for a form field
 * @param {string} fieldId - ID of the field
 * @param {string} message - Error message to display
 */
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + 'Error');
  const container = document.getElementById(fieldId + 'Container');

  field.classList.remove('success');
  field.classList.add('error');
  if (container) {
    container.classList.remove('success');
    container.classList.add('error');
  }

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  }
}

/**
 * Shows success state for a form field
 * @param {string} fieldId - ID of the field
 */
function showSuccess(fieldId) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + 'Error');
  const container = document.getElementById(fieldId + 'Container');

  field.classList.remove('error');
  field.classList.add('success');
  if (container) {
    container.classList.remove('error');
    container.classList.add('success');
  }

  if (errorDiv) {
    errorDiv.classList.remove('show');
  }
}

/**
 * Clears all error states from the form
 */
function clearErrors() {
  const errorMessages = document.querySelectorAll('.error-message');
  const inputs = document.querySelectorAll(
    '.form-input, .url-input, .form-textarea'
  );
  const containers = document.querySelectorAll('.url-input-container');

  errorMessages.forEach((msg) => msg.classList.remove('show'));
  inputs.forEach((input) => {
    input.classList.remove('error', 'success');
  });
  containers.forEach((container) => {
    container.classList.remove('error', 'success');
  });
}

/**
 * Shows response message to user
 * @param {string} message - Message to display
 * @param {boolean} isSuccess - Whether this is a success message
 */
function showResponse(message, isSuccess = false) {
  responseMessage.textContent = message;
  responseMessage.className = `response-message ${isSuccess ? 'success' : 'error'
    }`;
}

/**
 * Sets loading state for submit button
 * @param {boolean} loading - Whether to show loading state
 */
function setLoading(loading) {
  submitBtn.disabled = loading;
  submitText.style.display = loading ? 'none' : 'inline';
  submitSpinner.style.display = loading ? 'inline-block' : 'none';
}

// =============================================================================
// DEVELOPER REWARDS FUNCTIONALITY
// =============================================================================

/**
 * Adds a new developer row to the form
 */
function addDeveloperRow() {
  const container = document.getElementById('developerRewardsContainer');
  const newRow = document.createElement('div');
  newRow.className = 'developer-row';
  newRow.innerHTML = `
    <div class="developer-input-group">
      <input
        type="text"
        class="form-input developer-id"
        placeholder="Developer ID"
      />
      <input
        type="number"
        class="form-input developer-reward"
        placeholder="Reward %"
        min="0"
        max="100"
        step="1"
      />
    </div>
    <button type="button" class="remove-developer-btn">×</button>
  `;

  const removeBtn = newRow.querySelector('.remove-developer-btn');
  removeBtn.addEventListener('click', function () {
    removeDeveloperRow(newRow);
  });

  container.appendChild(newRow);
  updateRemoveButtons();
}

/**
 * Removes a developer row from the form
 * @param {HTMLElement} row - Row element to remove
 */
function removeDeveloperRow(row) {
  row.remove();
  updateRemoveButtons();
}

/**
 * Updates visibility of remove buttons based on row count
 */
function updateRemoveButtons() {
  const rows = document.querySelectorAll('.developer-row');
  const removeButtons = document.querySelectorAll('.remove-developer-btn');

  removeButtons.forEach((btn, index) => {
    if (rows.length === 1) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'flex';
    }
  });
}

/**
 * Collects developer rewards data from form
 * @returns {Array} Array of developer objects with id and rewardPercentage
 */
function getDeveloperRewardsData() {
  const developers = [];
  const rows = document.querySelectorAll('.developer-row');

  rows.forEach(row => {
    const idInput = row.querySelector('.developer-id');
    const rewardInput = row.querySelector('.developer-reward');

    const id = idInput.value.trim();
    const reward = parseFloat(rewardInput.value);

    if (id && !isNaN(reward) && reward > 0) {
      developers.push({
        id: id,
        rewardPercentage: reward
      });
    }
  });

  return developers;
}

// =============================================================================
// FORM SUBMISSION HANDLER
// =============================================================================

/**
 * Main form submission handler
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors and messages
  clearErrors();
  showResponse('', false);

  // Collect form data
  const formData = {
    name: document.getElementById('gameName').value.trim(),
    gameUrl: document.getElementById('gameUrl').value.trim(),
    description: document.getElementById('gameDescription').value.trim(),
    twitter: document.getElementById('twitter').value.trim(),
    discord: document.getElementById('discord').value.trim(),
    isHTMLGame: document.getElementById('isHTMLGame').checked,
    tokens: selectedTokens,
    developers: getDeveloperRewardsData(),
  };

  // Get image files
  const gameImageFile = document.getElementById('gameImage').files[0];
  const coverImageFile = document.getElementById('coverImage').files[0];

  // Validate all form fields
  let hasErrors = false;

  // Required fields validation
  const nameError = validateRequired(formData.name, 'Game name');
  if (nameError) {
    showError('gameName', nameError);
    hasErrors = true;
  } else {
    showSuccess('gameName');
  }

  const urlError =
    validateRequired(formData.gameUrl, 'Game URL') ||
    validateUrl(formData.gameUrl, 'Game URL');
  if (urlError) {
    showError('gameUrl', urlError);
    hasErrors = true;
  } else {
    showSuccess('gameUrl');
  }

  const descriptionError = validateRequired(
    formData.description,
    'Description'
  );
  if (descriptionError) {
    showError('gameDescription', descriptionError);
    hasErrors = true;
  } else {
    showSuccess('gameDescription');
  }

  // Image validation
  const gameImageError =
    validateRequired(gameImageFile, 'Game image') ||
    validateImageFile(gameImageFile, 'Game image');
  if (gameImageError) {
    showError('gameImage', gameImageError);
    hasErrors = true;
  } else {
    showSuccess('gameImage');
  }

  if (coverImageFile) {
    const coverImageError = validateImageFile(
      coverImageFile,
      'Cover image'
    );
    if (coverImageError) {
      showError('coverImage', coverImageError);
      hasErrors = true;
    } else {
      showSuccess('coverImage');
    }
  }

  // Optional fields validation
  if (formData.twitter) {
    const twitterError = validateTwitter(formData.twitter);
    if (twitterError) {
      showError('twitter', twitterError);
      hasErrors = true;
    } else {
      showSuccess('twitter');
    }
  }

  if (formData.discord) {
    const discordError = validateDiscord(formData.discord);
    if (discordError) {
      showError('discord', discordError);
      hasErrors = true;
    } else {
      showSuccess('discord');
    }
  }

  if (hasErrors) {
    return;
  }

  // Submit form
  setLoading(true);

  try {
    // Convert images to base64
    if (gameImageFile) {
      formData.image = await fileToBase64(gameImageFile);
    }
    if (coverImageFile) {
      formData.coverImage = await fileToBase64(coverImageFile);
    }

    const result = await registerGame(formData);

    if (result.success && result.game) {
      showResponse(
        `✅ Game registered successfully! API Key: ${result.game.apiKey}`,
        true
      );

      // Reset form on success
      form.reset();
      clearErrors();

      // Clear image previews
      clearImagePreview(
        document.getElementById('gameImagePreview'),
        document
          .getElementById('gameImage')
          .closest('.file-upload-container')
      );
      clearImagePreview(
        document.getElementById('coverImagePreview'),
        document
          .getElementById('coverImage')
          .closest('.file-upload-container')
      );
    } else {
      showResponse(
        '❌ Registration failed: No game data returned',
        false
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    showResponse(`❌ Registration failed: ${error.message}`, false);
  } finally {
    setLoading(false);
  }
});

// =============================================================================
// REAL-TIME VALIDATION EVENT LISTENERS
// =============================================================================

// Game name validation
document.getElementById('gameName').addEventListener('blur', function () {
  const error = validateRequired(this.value, 'Game name');
  if (error) {
    showError('gameName', error);
  } else {
    showSuccess('gameName');
  }
});

// Game URL validation
document.getElementById('gameUrl').addEventListener('blur', function () {
  const error =
    validateRequired(this.value, 'Game URL') ||
    validateUrl(this.value, 'Game URL');
  if (error) {
    showError('gameUrl', error);
  } else {
    showSuccess('gameUrl');
  }
});

// Description validation
document
  .getElementById('gameDescription')
  .addEventListener('blur', function () {
    const error = validateRequired(this.value, 'Description');
    if (error) {
      showError('gameDescription', error);
    } else {
      showSuccess('gameDescription');
    }
  });

// Twitter validation
document.getElementById('twitter').addEventListener('blur', function () {
  if (this.value) {
    const error = validateTwitter(this.value);
    if (error) {
      showError('twitter', error);
    } else {
      showSuccess('twitter');
    }
  }
});

// Discord validation
document.getElementById('discord').addEventListener('blur', function () {
  if (this.value) {
    const error = validateDiscord(this.value);
    if (error) {
      showError('discord', error);
    } else {
      showSuccess('discord');
    }
  }
});

// =============================================================================
// FILE INPUT EVENT LISTENERS
// =============================================================================

// Game image file handling
document
  .getElementById('gameImage')
  .addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('gameImagePreview');
    const container = this.closest('.file-upload-container');

    if (file) {
      showImagePreview(file, preview, container);
    } else {
      clearImagePreview(preview, container);
    }
  });

// Cover image file handling
document
  .getElementById('coverImage')
  .addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('coverImagePreview');
    const container = this.closest('.file-upload-container');

    if (file) {
      showImagePreview(file, preview, container);
    } else {
      clearImagePreview(preview, container);
    }
  });

// =============================================================================
// DEVELOPER REWARDS EVENT LISTENERS
// =============================================================================

// Add developer button
document.getElementById('addDeveloperBtn').addEventListener('click', addDeveloperRow);

// Initialize developer rewards on page load
document.addEventListener('DOMContentLoaded', function () {
  const initialRemoveBtn = document.querySelector('.remove-developer-btn');
  if (initialRemoveBtn) {
    initialRemoveBtn.addEventListener('click', function () {
      removeDeveloperRow(this.closest('.developer-row'));
    });
  }
  updateRemoveButtons();
}); 
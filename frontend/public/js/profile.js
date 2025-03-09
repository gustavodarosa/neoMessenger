/**
 * Profile Manager - Handles user profile functionality
 */
const ProfileManager = (() => {
  let currentUserId;
  let currentUserName;
  
  /**
   * Initialize the profile manager
   * @returns {Promise<Object>} - The current user's information
   */
  const initialize = async () => {
    try {
      // Fetch user info first
      const user = await fetchUserInfo();
      
      if (user) {
        currentUserId = user._id;
        currentUserName = user.name || user.username;
        
        // Set up the avatar upload functionality
        setupAvatarUpload();
        
        // Set up bio editing functionality
        setupBioEditing();
        
        console.log("ProfileManager initialized successfully");
        return user;
      } else {
        console.error("Failed to initialize profile manager: User info not available");
        return null;
      }
    } catch (error) {
      console.error("Error initializing profile manager:", error);
      return null;
    }
  };

  /**
   * Fetch current user information
   * @returns {Promise<Object>} - The user object
   */
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const user = await response.json();
      
      // Set the user's name in the h2 with id "user-name"
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        userNameElement.textContent = user.name || user.username;
      }

      // Update user bio if available
      const userBioElement = document.getElementById('user-bio');
      if (userBioElement && user.bio) {
        userBioElement.textContent = user.bio;
      }

      // Update avatar with the one from database
      if (user.avatar && user.avatar !== "/assets/avatar.png") {
        // Use a complete URL by prepending the server address
        const avatarUrl = `http://localhost:3000${user.avatar}`;
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
          // Set the image source and add an error handler in case the image can't be loaded
          userAvatar.onerror = function() {
            console.error("Failed to load avatar image from:", avatarUrl);
            this.src = "../assets/avatar.png"; // Fallback to default
            this.onerror = null; // Prevent infinite loop
          };
          userAvatar.src = `${avatarUrl}?t=${Date.now()}`; // Add timestamp to bust cache
        }
      }

      console.log("User from DB:", user);
      return user; // Return user object for chaining
    } catch (error) {
      console.error("Error fetching user information:", error);
      return null;
    }
  };

  /**
   * Set up avatar upload functionality
   */
  const setupAvatarUpload = () => {
    const avatarContainer = document.getElementById('avatar-container');
    const fileInput = document.getElementById('avatar-upload');
    const userAvatar = document.getElementById('user-avatar');
    
    if (!avatarContainer || !fileInput || !userAvatar) {
      console.error("Avatar elements not found in DOM");
      return;
    }
    
    // Add tooltip to show it's clickable
    avatarContainer.title = "Click to change your avatar";
    
    // Make the avatar container look clickable
    avatarContainer.style.cursor = 'pointer';
    
    // Click on avatar container triggers file selection
    avatarContainer.addEventListener('click', () => {
      fileInput.click();
    });
    
    // When a file is selected
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a JPEG or PNG image');
        return;
      }
      
      // Create loading indicator
      avatarContainer.classList.add('loading');
      
      // Prepare form data
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update avatar with new one
        // Using Date.now() to break the browser cache
        userAvatar.src = `${data.avatarUrl}?t=${Date.now()}`;
        
        // Display success feedback
        alert('Avatar updated successfully!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar. Please try again.');
      } finally {
        // Remove loading state
        avatarContainer.classList.remove('loading');
      }
    });
  };

  /**
   * Set up bio editing functionality
   */
  const setupBioEditing = () => {
    const bioContainer = document.querySelector('.bio-container');
    const bioText = document.getElementById('user-bio');
    const bioEditIcon = document.querySelector('.bio-edit-icon');
    
    if (!bioContainer || !bioText || !bioEditIcon) {
      console.error("Bio elements not found in DOM");
      return;
    }
    
    let originalBio = bioText.textContent;
    
    // When edit icon is clicked, replace text with editable input  
    bioEditIcon.addEventListener('click', () => {
      originalBio = bioText.textContent; // Store current text
      
      // Hide text and icon
      bioText.style.display = 'none';
      bioEditIcon.style.display = 'none';
      
      // Create input element
      const textArea = document.createElement('textarea');
      textArea.id = 'bio-edit-input';
      textArea.value = originalBio;
      bioContainer.appendChild(textArea);
      textArea.focus();
      
      // Auto-resize textarea to fit content
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
      
      // Handle Enter key (save) and Escape key (cancel)
      textArea.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          await saveBio(textArea.value);
        } else if (e.key === 'Escape') {
          cancelEdit();
        }
      });
      
      // Handle blur (clicking outside)
      textArea.addEventListener('blur', async () => {
        const newBio = textArea.value.trim();
        
        // Only save if content changed 
        if (newBio !== originalBio) {
          await saveBio(newBio);
        } else {
          cancelEdit();
        }
      });
      
      // When user types, auto-resize the textarea
      textArea.addEventListener('input', () => {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
      });
    });
    
    async function saveBio(newBio) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/bio', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bio: newBio })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update bio');
        }
        
        // Update UI with new bio
        bioText.textContent = newBio;
        completeEdit();
      } catch (error) {
        console.error('Error updating bio:', error);
        // Revert to original if save failed
        bioText.textContent = originalBio;
        completeEdit();
      }
    }
    
    function cancelEdit() {
      // Revert to original state
      completeEdit();
    }
    
    function completeEdit() {
      // Remove textarea
      const textArea = document.getElementById('bio-edit-input');
      if (textArea) {
        textArea.remove();
      }
      
      // Show text and edit icon again
      bioText.style.display = 'block';
      bioEditIcon.style.display = 'inline';
    }
  };

  /**
   * Fetch user details by ID
   * @param {string} userId - The user ID to fetch details for
   * @returns {Promise<Object>} - The user details
   */
  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  /**
   * Get the current user's ID
   * @returns {string} - The current user's ID
   */
  const getCurrentUserId = () => {
    return currentUserId;
  };

  /**
   * Get the current user's name
   * @returns {string} - The current user's name
   */
  const getCurrentUserName = () => {
    return currentUserName;
  };
  
  // Public API
  return {
    initialize,
    fetchUserInfo,
    fetchUserDetails,
    getCurrentUserId,
    getCurrentUserName
  };
})();

// Make ProfileManager globally available
window.ProfileManager = ProfileManager;

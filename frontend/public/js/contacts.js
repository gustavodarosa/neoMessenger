/**
 * Contact Manager - Handles contact-related functionality
 */
const ContactManager = (() => {
  let contacts = [];
  
  /**
   * Initialize contact management
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  const initialize = async () => {
    try {
      // Set up add contact icon click event
      const addContactIcon = document.querySelector('.add-contact-icon');
      if (addContactIcon) {
        addContactIcon.addEventListener('click', () => {
          window.open('addContact.html', '_blank', 'width=400,height=300');
        });
      }
      
      // Load contacts
      await fetchContacts();
      return true;
    } catch (error) {
      console.error("Error initializing contact manager:", error);
      return false;
    }
  };

  /**
   * Fetch contacts from the server and display them
   * @returns {Promise<Array>} - The fetched contacts
   */
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return [];
      }
      
      console.log("Fetching contacts from database...");
      const response = await fetch('http://localhost:3000/api/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error(`Error fetching contacts: ${response.status}`);
        return [];
      }
      
      contacts = await response.json();
      console.log("All contacts:", contacts);
      console.log(`Total contacts found: ${contacts.length}`);
      
      // If no contacts found, log a message
      if (contacts.length === 0) {
        console.log("No contacts found. You may need to add some contacts first.");
      } else {
        // Log each contact with detailed information
        contacts.forEach((contact, index) => {
          console.log(`Contact ${index + 1}:`, {
            id: contact._id,
            userId: contact.userId,
            contactId: contact.contactId,
            createdAt: contact.createdAt
          });
        });
      }
      
      // Display contacts in the UI
      await renderContacts();
      
      return contacts;
    } catch (error) {
      console.error("Exception while fetching contacts:", error);
      return [];
    }
  };
  
  /**
   * Render contacts to the UI
   */
  const renderContacts = async () => {
    const contactList = document.getElementById('contact-list');
    if (!contactList) return;
    
    contactList.innerHTML = ''; // Clear existing contacts
    
    if (contacts.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = "No contacts found";
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '20px';
      contactList.appendChild(emptyMessage);
    } else {
      // Add CSS styles for contact list items
      addContactListStyles();
      
      for (const contact of contacts) {
        // Create list item for contact
        const li = document.createElement('li');
        li.classList.add('contact-item');
        li.setAttribute('data-contact-id', contact.contactId); // Add attribute for easier finding this contact
        
        // Create and add avatar
        const avatar = document.createElement('img');
        avatar.classList.add('contact-avatar');
        
        // Debug the contact data 
        console.log("Processing contact:", contact);
        
        // Get the contact's name for display
        const displayName = contact.name || 'Unknown Contact';
        
        // Set up avatar with fallback to default avatar
        if (contact.avatar) {
          avatar.src = `http://localhost:3000${contact.avatar}`;
        } else {
          // Use generated avatar with initials
          avatar.src = createDefaultAvatar(displayName);
        }
        
        // Add error handler in case avatar fails to load
        avatar.onerror = function() {
          console.log(`Failed to load avatar for contact: ${displayName}`);
          this.src = createDefaultAvatar(displayName);
          this.onerror = null; // Prevent infinite loop
        };
        
        // Create name element
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('contact-name');
        nameSpan.textContent = displayName;
        
        // Create status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.classList.add('contact-status');
        
        // Add status class if available
        if (contact.status) {
          statusIndicator.classList.add(contact.status);
        } else {
          statusIndicator.classList.add('online'); // Default status
        }
        
        // Add all elements to the list item
        li.appendChild(avatar);
        li.appendChild(nameSpan);
        li.appendChild(statusIndicator);
        
        // Add click listener to open chat
        li.addEventListener('click', () => {
          if (window.MessageManager && typeof window.MessageManager.openChatWindow === 'function') {
            window.MessageManager.openChatWindow(contact);
          } else {
            console.error("MessageManager not available");
          }
        });
        
        contactList.appendChild(li);

        // Now fetch the actual user information for this contact
        const contactUser = await getContactInfo(contact.contactId);
        console.log("Retrieved contact user info:", contactUser);
        
        if (contactUser) {
          // Update the contact name from the user object
          nameSpan.textContent = contactUser.username || contactUser.name || `User ${contact.contactId.substr(-6)}`;
          
          // Update avatar if available
          if (contactUser.avatar) {
            avatar.src = `http://localhost:3000${contactUser.avatar}`;
          } else {
            avatar.src = createDefaultAvatar(contactUser.username || contactUser.name || "User");
          }
          
          // Update in the contact object (for when clicking)
          contact.name = contactUser.username || contactUser.name;
          contact.avatar = contactUser.avatar;
        } else {
          // Use fallback values if user info not available
          nameSpan.textContent = contact.name || `Contact ID: ${contact.contactId.substr(-6)}`;
          avatar.src = createDefaultAvatar(nameSpan.textContent);
        }
      }
    }
  };
  
  /**
   * Add CSS styles for contact list to the document
   */
  const addContactListStyles = () => {
    const styleId = 'contact-list-styles';
    if (document.getElementById(styleId)) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .contact-item {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.2s;
      }
      
      .contact-item:hover {
        background-color: #e0e0e0;
      }
      
      .contact-avatar {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        margin-right: 12px;
        object-fit: cover;
        background-color: #ddd;
      }
      
      .contact-name {
        font-size: 15px;
        flex-grow: 1;
      }
      
      .contact-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-left: auto;
        background-color: #ccc;
      }
      
      .contact-status.online {
        background-color: rgba(var(--online-color), 1);
      }
      
      .contact-status.ausente {
        background-color: rgba(var(--ausente-color), 1);
      }
      
      .contact-status.ocupado {
        background-color: rgba(var(--ocupado-color), 1);
      }
    `;
    document.head.appendChild(styleElement);
  };
  
  /**
   * Create a default avatar with initials
   * @param {string} name - The name to use for initials
   * @returns {string} - Data URL of the generated avatar
   */
  const createDefaultAvatar = (name) => {
    // Handle missing or invalid names better
    if (!name || name === 'undefined' || name === 'User' || name.trim() === '') {
      name = 'Contact';
    }
    
    // Extract initials from name - handle different formats
    let initials = '';
    const nameParts = name.trim().split(/\s+/); // Split by any whitespace
    
    // Get first letter of first name
    if (nameParts[0]) {
      initials += nameParts[0].charAt(0).toUpperCase();
    }
    
    // Get first letter of last name if available
    if (nameParts.length > 1) {
      const lastIndex = nameParts.length - 1;
      initials += nameParts[lastIndex].charAt(0).toUpperCase();
    }
    
    // If we still don't have initials, use first two letters of name or first letter
    if (!initials && name.length > 0) {
      initials = name.charAt(0).toUpperCase();
      if (name.length > 1) {
        initials += name.charAt(1).toLowerCase();
      }
    }
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Generate a color based on the name to ensure consistent colors for the same contact
    const nameHash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const hue = nameHash % 360;
    
    // Use a defined color palette for better aesthetics
    const bgColor = `hsl(${hue}, 60%, 80%)`;
    const textColor = `hsl(${hue}, 70%, 30%)`;
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle border
    ctx.strokeStyle = `hsla(${hue}, 60%, 60%, 0.3)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Add initials
    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width/2, canvas.height/2);
    
    return canvas.toDataURL('image/png');
  };
  
  /**
   * Get user information for a contact
   * @param {string} contactId - The contact's user ID
   * @returns {Promise<Object>} - The contact's user information
   */
  const getContactInfo = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.warn(`Could not fetch info for contact ID: ${contactId}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching contact info for ID: ${contactId}`, error);
      return null;
    }
  };
  
  /**
   * Highlight a contact in the UI (for notifications)
   * @param {string} contactId - ID of the contact to highlight
   */
  const highlightContact = (contactId) => {
    const contactElement = document.querySelector(`.contact-item[data-contact-id="${contactId}"]`);
    if (contactElement) {
      // Add a notification highlight class
      contactElement.classList.add('new-message');
      
      // Remove the class after animation completes
      setTimeout(() => {
        contactElement.classList.remove('new-message');
      }, 1000);
    }
  };
  
  /**
   * Get all contacts
   * @returns {Array} - The contacts
   */
  const getAllContacts = () => {
    return contacts;
  };
  
  /**
   * Get a specific contact by ID
   * @param {string} id - The contact ID to find
   * @returns {Object|null} - The contact or null if not found
   */
  const getContactById = (id) => {
    return contacts.find(contact => contact.contactId === id || contact._id === id) || null;
  };
  
  // Public API
  return {
    initialize,
    fetchContacts,
    getAllContacts,
    getContactById,
    getContactInfo,
    highlightContact,
    createDefaultAvatar
  };
})();

// Make ContactManager globally available
window.ContactManager = ContactManager;

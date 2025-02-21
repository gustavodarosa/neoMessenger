document.addEventListener('DOMContentLoaded', () => {
  // Function to display error/success messages
  function showMessage(elementId, message, isError = true) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
      messageElement.style.color = isError ? 'red' : 'green';
    }
  }

  // Handle registration
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      if (password !== confirmPassword) {
        showMessage('error-message', 'As senhas não coincidem.');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          showMessage('error-message', '✅ Usuário registrado com sucesso!', false);
          setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
          showMessage('error-message', data.error || 'Erro ao registrar usuário.');
        }
      } catch (error) {
        showMessage('error-message', 'Erro ao conectar ao servidor.');
      }
    });
  }

  // Handle login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const response = await fetch('http://localhost:3000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          showMessage('error-message', '✅ Login realizado com sucesso!', false);
          setTimeout(() => {
            const screenHeight = window.screen.height * 0.75;
            window.open('app.html', '_blank', `width=300,height=${screenHeight}`);
          }, 2000);
        } else {
          showMessage('error-message', data.error || 'Erro ao fazer login.');
        }
      } catch (error) {
        showMessage('error-message', 'Erro ao conectar ao servidor.');
      }
    });
  }

  // Handle logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Status update for avatar
  const statusSelect = document.getElementById('status');
  const avatarBorder = document.querySelector('.avatar-border');
  if (statusSelect && avatarBorder) {
    statusSelect.addEventListener('change', function() {
      avatarBorder.classList.remove('online', 'ausente', 'ocupado', 'invisivel');
      avatarBorder.classList.add(this.value);
    });
  } else {
    console.warn("Either 'status' or '.avatar-border' element is missing.");
  }

  // Load contacts and open chat window
  const contactList = document.getElementById('contact-list');
  if (contactList) {
    async function loadContacts() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const contacts = await response.json();
        contactList.innerHTML = '';
        contacts.forEach(contact => {
          const li = document.createElement('li');
          li.textContent = contact.name; // adjust if necessary
          li.classList.add('contact-item');
          li.addEventListener('click', () => {
            openChatWindow(contact);
          });
          contactList.appendChild(li);
        });
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }
    loadContacts();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const moonIcon = document.getElementById('moon-icon');
  if (moonIcon) {
    moonIcon.addEventListener('click', () => {
      document.body.classList.toggle('escuro');
    });
  }
});

// Global openChatWindow function
function openChatWindow(contact) {
  const chatWindow = window.open('', '_blank', 'width=500,height=700');
  chatWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chat com ${contact.name}</title>
      <link rel="stylesheet" href="styles.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>
        html, body {
          height: 100%;
          width: 100vw;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          box-sizing: border-box;
          background-color: #f9f9f9;
        }
        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 15px;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .chat-header img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          margin-right: 15px;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
        }
        .contact-info h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f0f0f0;
          width: 100%;
        }
        .chat-input {
          margin: 0 10px;
          padding: 10px;
          background-color: #fff;
          border-top: 1px solid #ddd;
          display: flex;
          align-items: center;
          width: calc(100% - 20px);
        }
        .message-bar {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          font-size: 1rem;
          outline: none;
        }
        .send-icon {
          margin-left: 10px;
          font-size: 1.5rem;
          cursor: pointer;
          color: #0078C8;
          background: transparent;
        }
      </style>
    </head>
    <body>
      <div class="chat-header">
        <img src="${contact.photo || '../assets/default-avatar.png'}" alt="Avatar">
        <div class="contact-info">
          <h2>${contact.name}</h2>
          <p>${contact.bio || 'Sem bio'}</p>
          <p>Status: ${contact.status || 'Desconhecido'}</p>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input">
        <div id="message-bar" contenteditable="true" class="message-bar" placeholder="Digite sua mensagem..."></div>
        <i id="send-icon" class="fas fa-paper-plane send-icon"></i>
      </div>
      <script>
        const token = localStorage.getItem('token');
        const chatMessages = document.getElementById('chat-messages');
        const messageBar = document.getElementById('message-bar');
        const sendIcon = document.getElementById('send-icon');

        async function loadMessages(contactId) {
          try {
            const response = await fetch(\`http://localhost:3000/api/messages/\${contactId}\`, {
              headers: { 'Authorization': \`Bearer \${token}\` }
            });
            const messages = await response.json();
            chatMessages.innerHTML = '';
            messages.forEach(message => {
              const msgDiv = document.createElement('div');
              msgDiv.style.marginBottom = '10px';
              msgDiv.textContent = \`\${message.sender}: \${message.text}\`;
              chatMessages.appendChild(msgDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
          } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
          }
        }

        async function sendMessage() {
          if (!messageBar.textContent.trim()) return;
          try {
            const response = await fetch('http://localhost:3000/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${token}\`
              },
              body: JSON.stringify({
                recipientId: '${contact._id}',
                text: messageBar.textContent
              })
            });
            if (response.ok) {
              loadMessages('${contact._id}');
              messageBar.textContent = '';
            }
          } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
          }
        }

        sendIcon.addEventListener('click', sendMessage);
        messageBar.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
          }
        });

        loadMessages('${contact._id}');
      <\/script>
    </body>
    </html>
  `);
}

// Expose the function globally so it can be called from other scripts
window.openChatWindow = openChatWindow;
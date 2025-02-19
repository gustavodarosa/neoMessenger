document.addEventListener('DOMContentLoaded', () => {
  // Função para exibir mensagens de erro/sucesso
  function showMessage(elementId, message, isError = true) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
      messageElement.style.color = isError ? 'red' : 'green';
    }
  }

  // Handle de registro
  document.getElementById('register-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    if (password !== confirmPassword) {
      showMessage('error-message', 'As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
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

  // Handle de login
  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

  // Função para fazer requerimento para uma rota protegida
  async function fetchProtectedData() {
    const token = localStorage.getItem('token');
    console.log("Token found:", token);
    if (!token) {
      showMessage('error-message', 'Você precisa estar logado para acessar esta rota.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/protected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Dados protegidos:', data);
      } else {
        showMessage('error-message', data.error || 'Erro ao acessar dados protegidos.');
      }
    } catch (error) {
      showMessage('error-message', 'Erro ao conectar ao servidor.');
    }
  }

  // Verificar se o usuário está autenticado na página app.html
  if (window.location.pathname.endsWith('app.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      fetchProtectedData();
    }
  }

  // Handle de logout
  document.getElementById('logout-button')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Status do avatar
  const statusSelect = document.getElementById('status');
  const avatarBorder = document.querySelector('.avatar-border');
  if (statusSelect && avatarBorder) {
    statusSelect.addEventListener('change', function() {
      avatarBorder.classList.remove('online', 'ausente', 'ocupado', 'invisivel');
      avatarBorder.classList.add(this.value);
    });
  }

  // Carregar contatos e mensagens
  const token = localStorage.getItem('token');
  if (!token && window.location.pathname.endsWith('app.html')) {
    window.location.href = 'login.html';
  }

  const contactList = document.getElementById('contact-list');
  const chatWith = document.getElementById('chat-with');
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  let currentContact = null;

  async function loadContacts() {
    console.log("loadContacts executed");
    try {
      const response = await fetch('http://localhost:3000/api/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("Response status:", response.status);
      const contacts = await response.json();
      console.log("Contacts data:", contacts);

      contactList.innerHTML = ''; // Limpar contatos existentes

      if (contacts.length === 0) {
        const li = document.createElement('li');
        li.style.listStyle = 'none';
        li.innerHTML = `Bem vindo ao NeoMessenger, você ainda não tem nimguém na lista de contatos. <a href="#" id="add-contact-link">Adicionar contato</a>.`;
        contactList.appendChild(li);
        const addContactLink = document.getElementById('add-contact-link');
        if (addContactLink) {
          addContactLink.addEventListener('click', () => {
            console.log('Add contact clicked');
            // Adicione sua lógica de "adicionar contato" aqui
          });
        }
      } else {
        contacts.forEach(contact => {
          const li = document.createElement('li');
          li.textContent = contact.name;
          li.addEventListener('click', () => {
            const chatWithEl = document.getElementById('chat-with');
            if (chatWithEl) {
              chatWithEl.textContent = `Chat com: ${contact.name}`;
            }
            loadMessages(contact.id);
          });
          contactList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  }

  async function loadMessages(contactId) {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const messages = await response.json();
      chatMessages.innerHTML = '';
      messages.forEach(message => {
        const div = document.createElement('div');
        div.textContent = `${message.sender}: ${message.text}`;
        chatMessages.appendChild(div);
      });
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  async function sendMessage() {
    if (!currentContact || !messageInput.value.trim()) return;
    try {
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: currentContact.id,
          text: messageInput.value
        })
      });
      if (response.ok) {
        loadMessages(currentContact.id);
        messageInput.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  loadContacts();
});
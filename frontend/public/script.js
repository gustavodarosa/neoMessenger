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

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Opcional: Verificação de senha igual
    if(password !== confirmPassword){
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

  // Handle de login
  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
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

  // Função para fazer requisição para uma rota protegida
  async function fetchProtectedData() {
    const token = localStorage.getItem('token');
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

  // Verificar se o usuário está autenticado ao carregar a página app.html
  if (window.location.pathname.endsWith('app.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      fetchProtectedData();
    }
  }

  // Handle de logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Status do avatar
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

  // Função para carregar contatos
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
    try {
      const token = localStorage.getItem('token'); // ensure token exists
      const response = await fetch('http://localhost:3000/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const contacts = await response.json();
      const ul = document.getElementById('contact-list');
      ul.innerHTML = '';
      contacts.forEach(contact => {
        const li = document.createElement('li');
        li.textContent = contact.name;  // adjust as needed
        ul.appendChild(li);
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  
  // Call the function to load contacts when page loads.
  loadContacts();
});

document.addEventListener('DOMContentLoaded', () => {
  const moonIcon = document.getElementById('moon-icon');
  moonIcon.addEventListener('click', () => {
    document.body.classList.toggle('escuro');
  });
});
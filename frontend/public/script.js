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
        setTimeout(() => window.location.href = 'index.html', 2000);
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

  // Chamar a função de rota protegida somente se estivermos na página principal (index.html)
  if (window.location.pathname.endsWith('index.html')) {
    fetchProtectedData();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const statusSelect = document.getElementById('status');
  const avatarBorder = document.querySelector('.avatar-border');

  statusSelect.addEventListener('change', function() {
    // Remove todas as classes de status anteriores
    avatarBorder.classList.remove('online', 'ausente', 'ocupado', 'invisivel');
    
    // Adiciona a nova classe de acordo com a seleção
    avatarBorder.classList.add(this.value);
  });
});

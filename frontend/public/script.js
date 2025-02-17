document.addEventListener('DOMContentLoaded', () => {
  // Function to display error/success messages
  function showMessage(elementId, message, isError = true) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.style.color = isError ? 'red' : 'green';
  }

  // Handle registration
  document.getElementById('register-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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

  // Handle login
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
        showMessage('error-message', '✅ Login realizado com sucesso!', false);
        setTimeout(() => window.location.href = 'index.html', 2000);
      } else {
        showMessage('error-message', data.error || 'Erro ao fazer login.');
      }
    } catch (error) {
      showMessage('error-message', 'Erro ao conectar ao servidor.');
    }
  });
});
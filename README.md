# 🚀 neoMessenger – A Retro-Inspired Chat Experience!

neoMessenger is a modern chat application designed with a nostalgic aesthetic, bringing back the charm of early instant messaging. With a sleek yet vintage-inspired interface, customizable status messages, and expressive emojis, it recreates the fun and personality of classic online conversations.

## 🎨 Features
- ✅ User authentication with JWT
- ✅ Protected routes
- ✅ Unique retro-style chat interface
- ✅ Smooth and responsive design
- ✅ Lightweight and easy to use

## 📦 Installation

To run neoMessenger locally, follow these steps:

```sh
# Clone the repository
git clone https://github.com/gustavodarosa/neoMessenger.git

# Navigate to the project folder
cd neoMessenger

# Navigate to the backend folder
cd backend

# Install backend dependencies
npm install

# Create a .env file in the backend folder and add:
# MONGODB_URI=mongodb://localhost:27017/neoMessenger
# PORT=3000
# JWT_SECRET=your_jwt_secret

# Start the backend server
npm run dev

# Open a new terminal and navigate to the frontend folder
cd ../frontend/public

# Run the frontend using Live Server (port 5500)
```

## 🚀 Usage

### Register a New User
1. Open `frontend/public/register.html` in your browser
2. Fill in the registration form and submit

### Login
1. Open `frontend/public/login.html` in your browser
2. Fill in the login form with your credentials
3. Upon successful login, you'll be redirected to the main page

### Access Protected Routes
1. After login, your JWT token is stored in localStorage
2. Protected routes require the Authorization header:
   - Method: GET
   - URL: `http://localhost:3000/api/users/protected`
   - Headers: `Authorization: Bearer <your_token>`

## 🚧 Roadmap
- [x] Implement user authentication
- [ ] Add customizable themes
- [ ] Enable real-time messaging
- [ ] Support for GIFs and stickers

## 🤝 Contributing
We welcome contributions! Feel free to fork the repo, create a new branch, and submit a pull request.

## 📜 License
This project is licensed under the MIT License.

---

Let's bring back the joy of chatting in style! 💬✨
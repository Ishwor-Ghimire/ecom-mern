# CheapGPT Nepal — E-Commerce Platform

A full-stack MERN e-commerce platform for selling affordable digital products (Netflix, Spotify, ChatGPT, Adobe & more) to customers in Nepal.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS        |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB (Mongoose)                  |
| Auth     | JWT + Google OAuth 2.0 (Passport.js)|
| Payments | eSewa / Khalti (manual verification)|
| Email    | Nodemailer (Gmail SMTP)             |
| Storage  | Local file uploads (Multer)         |

---

## Features

- 🛍️ Product catalog with categories, tags, and filters
- 💰 Flexible pricing — single price, multiple durations, or variants (e.g. Family/Single)
- 🔥 Hot deals with discount display
- 🛒 Persistent cart with plan selection
- 🔐 JWT auth + Google OAuth login/signup
- 👤 User profiles and order history
- 📦 Admin dashboard — create, edit, delete products
- 📧 Email notifications
- 📱 WhatsApp support integration
- 🌐 Fully responsive design

---

## Project Structure

```
ecom-mern/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Route-level pages
│       ├── components/
│       ├── context/ # AuthContext
│       └── api/     # Axios instance
└── server/          # Express backend
    └── src/
        ├── controllers/
        ├── models/
        ├── routes/
        └── middleware/
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.19 or >= 22.12
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/Ishwor-Ghimire/ecom-mern.git
cd ecom-mern
```

### 2. Setup the Server
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=YourName <your_email@gmail.com>
```

```bash
npm run dev
```

### 3. Setup the Client
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

| Variable              | Description                          |
|-----------------------|--------------------------------------|
| `MONGO_URI`           | MongoDB connection string            |
| `JWT_SECRET`          | Secret for signing JWT tokens        |
| `CLIENT_URL`          | Frontend URL (for CORS)              |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET`| Google OAuth client secret           |
| `SMTP_*`              | Gmail SMTP credentials               |

---

## License

MIT

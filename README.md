---

# 🚀 Project

---

## 🛠️ Setup Instructions

### 1️⃣ Install Dependencies

First, install all necessary packages:

```bash
npm install
```

---

### 2️⃣ Configure Environment Variables

This project uses environment variables for backend connectivity.

* Copy the provided `.env.example` file as `.env`:

  ```bash
  cp .env.example .env
  ```

* Update the `.env` file with your backend API link:

  ```
  VITE_BACKEND_URL=your-backend-url-here
  ```

---

## 🎨 Tech Stack

* **React** 
* **Tailwind CSS** (for styling)
* **TypeScript** 
* **Vite** (for blazing-fast dev and build)
* **Backend** (via API at `VITE_BACKEND_URL`)

---

## 🚀 Available Scripts

### Start Development Server

```bash
npm run dev
```

Your React app will be running at [http://localhost:5173](http://localhost:5173) (or as configured by Vite).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🌟 Environment Variables

Make sure your `.env` file has the following (copied from `.env.example`):

```env
VITE_BACKEND_URL=your-backend-url-here
```

This is the API endpoint your frontend will use to communicate with the backend.

---

## 💡 Notes

* The **`.env.example`** file is provided for easy setup.
* Never commit your actual `.env` file to version control.
* Tailwind CSS is already configured. You can start using Tailwind classes right away!

---
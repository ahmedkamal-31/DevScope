# DevScope 🚀

**DevScope** is a full-stack web application designed to seamlessly explore GitHub developers' profiles, repositories, and real-time activities. Built with React and .NET 8, it integrates GitHub OAuth to bypass standard API rate limits, ensuring a smooth and continuous user experience.

![DevScope Preview](<img width="2752" height="1536" alt="DevScope" src="https://github.com/user-attachments/assets/ca4d7eeb-5212-4ee1-bc71-602e14fe2ff0" />


## 🌐 Live Demo
**[Explore DevScope Live](https://dev-scope-nu.vercel.app)**

## ✨ Key Features

- **🔍 Live Developer Search:** Instantly search for any GitHub user and view their comprehensive profile data, bio, and stats.
- **🔐 Secure Authentication:** Seamless login using **GitHub OAuth 2.0**.
- **🚀 Rate Limit Bypass:** Authenticated users enjoy up to **5,000 API requests per hour** (bypassing the standard 60 req/hr limit for unauthenticated users).
- **📊 Real-Time Data:** Fetch up-to-date repositories, gists, and follower statistics directly from GitHub's official API.
- **🛡️ Secure Architecture:** Protects sensitive OAuth Client Secrets within the backend, keeping them hidden from the client side.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Deployment:** Vercel

### Backend
- **Framework:** ASP.NET Core Web API (.NET 8)
- **Deployment:** MonsterASP.NET (IIS Hosting)

### Integrations
- GitHub REST API
- GitHub OAuth Apps

## 💡 Architecture & Problem Solving

During the deployment phase, this project successfully navigated complex environment constraints:
- **Mixed Content & CORS Resolution:** The frontend is securely hosted on an `https` Vercel domain, while the backend relies on an `http` environment. To prevent browser security blocks (Mixed Content), a **Vercel Proxy Rewrite (`vercel.json`)** was implemented. This allows Vercel's backend to securely fetch data from the .NET API and serve it over HTTPS to the client, entirely bypassing CORS and Mixed Content restrictions without changing hosting providers.

## 💻 Getting Started (Local Development)

If you want to run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/ahmedkamal-31/DevScope.git](https://github.com/ahmedkamal-31/DevScope.git)
```

### 2. Backend Setup (.NET 8)
- Navigate to the API folder.
- Open `appsettings.json` and configure your GitHub OAuth credentials:
  ```json
  {
    "GitHub": {
      "ClientId": "YOUR_CLIENT_ID",
      "ClientSecret": "YOUR_CLIENT_SECRET",
      "RedirectUri": "http://localhost:5173"
    }
  }
  ```
- Run the API:
  ```bash
  dotnet run
  ```

### 3. Frontend Setup (React/Vite)
- Navigate to the frontend folder.
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file and add the local API base URL:
  ```env
  VITE_API_BASE_URL=http://localhost:5xxx/api
  ```
- Start the development server:
  ```bash
  npm run dev
  ```

## 🤝 Author
**Ahmed Kamal**
- GitHub: [@ahmedkamal-31](https://github.com/ahmedkamal-31)
- LinkedIn: [Ahmed Kamal](www.linkedin.com/in/ahmed-kamal3120)

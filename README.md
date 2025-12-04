# Welcome to Keep My Notes

- SmartNotes is your daily note-taking application.
- Offering seamless insights into project tracking and note-taking via AI-powered note summarizing.

# Tech Stack

- Frontend: React, Vite, Tailwind CSS(styling)
- Backend: Supabase, Groq API, Express.js 
- Deployment: Vercel(Frontend), Render(Backend)  
- Containerization: Docker

  



## Architecture Diagram

<img width="1018" height="574" alt="image" src="https://github.com/user-attachments/assets/8a00b29d-5ad5-4428-911b-360d7d232919" />

> Visual overview of how the application components (frontend, backend, database) interact in deployment.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js, Groq API
- **Database**: Supabase 
- **Deployment**: Vercel (Frontend), Render (Backend)  
- **Containerization**: Docker  

---

## Features

- Create, edit, and delete notes quickly.   
- Clean and responsive UI for both desktop and mobile.  
- Containerized application.
- AI-powered note summaries.
- Ready for scalable deployment and future enhancements.

---

## Getting Started

### Prerequisites

- Node.js & npm. 
- Docker & Docker Compose (only if containerization is a requirement). 
- A Supabase Project.

### Quick Start (With Docker)

```bash
git clone https://github.com/Aruisop/KeepMyNotes.git
cd KeepMyNotes
docker-compose up --build
```
- Once the containers are running:

```bash
- Frontend UI → http://localhost:3000
- Backend → http://localhost:5000
```

## Manual Setup (without Docker)
- Backend
```bash
cd backend
npm install
node index.js
```

- Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- Frontend: Deploy via Vercel.
- Backend: Deploy via Render.
- Establish a 3-way communication between Render, Vercel and Supabase for ease of use.

## Setup on your system
- Fork the repo.
- Create a new branch (e.g. feat/add-feature).
- Make your changes.
- Submit a pull request with a clear description of your changes.

## License
- See the LICENSE file for details.

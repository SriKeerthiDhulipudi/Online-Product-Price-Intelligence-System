# 🛒 Online Product Price Intelligence System (v2.0)

A robust, full-stack application that intelligently scrapes and compares product prices across multiple e-commerce platforms (Amazon, eBay, etc.) in real-time, helping users find the absolute best deals using an advanced scoring algorithm.

## ✨ Key Features
- **Intelligent Price Algorithm**: Calculates an "Intel Score" factoring in price, seller rating, and variable shipping costs, ensuring the *true* best deal is highlighted.
- **Dynamic Web Scraping**: Utilizes Headless Selenium Chrome to bypass JS-rendered pages on Amazon, and robust BeautifulSoup parsing for eBay.
- **Redis Caching Tier**: Prevents IP bans and drastically speeds up frequent searches by caching scraper results for 1 hour.
- **Historic Price Tracking**: Stores price points in PostgreSQL, allowing for visual trend analysis over 30+ days.
- **Beautiful Glassmorphism UI**: High-end React/Vite frontend using Tailwind CSS for a premium user experience (Responsive Cards, Micro-animations).
- **Secure Authentication**: JWT-based login and registration securely hashed with bcrypt.

## 🧰 Tech Stack
*   **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, Lucide Icons
*   **Backend**: FastAPI (Python), SQLAlchemy ORM
*   **Database**: PostgreSQL (Production) / SQLite (Local Dev fallback)
*   **Caching**: Redis
*   **Scraping Tools**: Selenium WebDriver, BeautifulSoup4, Requests
*   **DevOps & Security**: Docker Compose, GitHub Actions (CI/CD), JWT, Bcrypt

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (Optional, but recommended for Redis/Postgres)

### 1. Database & Cache Setup (Using Docker)
Start the PostgreSQL and Redis containers in the background:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Start the FastAPI Server
uvicorn app:app --reload --port 8000
```
*API Documentation automatically available at `http://localhost:8000/docs`*

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite Dev Server
npm run dev
```

Visit `http://localhost:5173` to experience the beautiful new Price Intelligence UI!

---

## 🔒 Security Implementation
- **CORS Restricted**: API explicitly controls origins.
- **Password Protection**: Passwords are mathematically hashed via passlib/bcrypt before touching the database. No plaintext storage.
- **Token Expiration**: JWT tokens expire strictly after 24 hours.
- **Bot Mitigation**: Selenium uses randomized User-Agents and headless chrome properties to avoid detection and IP blocks.

## 🧪 Testing
The CI/CD pipeline automatically runs the backend test suite utilizing `pytest`. To run tests locally:
```bash
cd backend
pytest test_app.py -v
```
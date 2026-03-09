# Job Scraper Platform

## Project Overview
A complete full stack job scraper platform that allows users to register, scrape job listings from platforms like Internshala and Unstop, apply to matching jobs, and track their application history contextually.

## Architecture
- **Frontend**: React.js with TailwindCSS (Bootstrapped with `create-react-app`)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Authentication**: JWT based token auth
- **Scraping**: BeautifulSoup4 handling DOM parsing and extraction

## Setup Steps

### 1. Database Setup
Ensure PostgreSQL is installed and running. Create a database named `job_scraper_db` with user `postgres` and password `postgres`, or update `backend/.env`.

### 2. Backend Setup
Navigate into the `backend` folder and set up the environment:
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
The server will start at `http://localhost:8000`.

### 3. Frontend Setup
Navigate into the `frontend` folder and run the client:
```bash
cd frontend
npm install
npm start
```
The client will start at `http://localhost:3000`.

## API Endpoints
- `POST /signup`: Register a new user
- `POST /login`: JWT authentication
- `POST /scrape-jobs`: Scrape job postings by keyword and location
- `POST /apply-job`: Register a job application
- `GET /applications`: Retrieve user job application history
- `GET /profile`: Retrieve current user profile
- `PUT /profile`: Update profile info
- `DELETE /profile/image`: Delete avatar

## Deployment Instructions
- Build the React App: `npm run build`
- Use NGINX to serve static frontend files.
- Containerize FastAPI with Docker and deploy using Gunicorn paired with standard Uvicorn workers.
- Add managed PostgreSQL instances for persistent storage.

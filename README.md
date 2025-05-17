# Whack-a-Mole High Scores Server

## Overview
This project involves creating a server-side application that manages high scores for a Whack-a-Mole Android game. The server provides an API for submitting new high scores and retrieving the top scores.

## Features

- Submit new high scores
- Retrieve top 100 high scores
- Input validation
- Rate limiting to prevent abuse
- Error handling
- PostgreSQL database for persistent storage

## Technical Stack
- **Backend Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **API Format**: RESTful JSON API

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JulianMatu/411A-server.git
   cd 411A-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `whackamole`.

4. Configure environment variables:
   - Copy `.env.example` to `.env` or create a new `.env` file
   - Update the database connection settings in `.env`

5. Initialize the database:
   ```bash
   npm run db:init
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Submit High Score

- **Endpoint:** `POST /api/highscores`
- **Purpose:** Add a new high score to the database
- **Request Body:**
  ```json
  {
    "name": "string",
    "score": "integer"
  }
  ```
- **Response:**
  ```json
  {
    "id": "integer",
    "name": "string",
    "score": "integer",
    "created_at": "timestamp"
  }
  ```

### Get Top High Scores

- **Endpoint:** `GET /api/highscores`
- **Purpose:** Retrieve the top 100 high scores, sorted by score (descending)
- **Response:**
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "score": "integer",
      "created_at": "timestamp"
    },
    ...
  ]
  ```

## License

This project is licensed under the ISC License.
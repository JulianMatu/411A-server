## Project Requirements Document: Whack-a-Mole High Scores Server

### Overview
This project involves creating a server-side application that manages high scores for a Whack-a-Mole Android game. The server will provide an API for submitting new high scores and retrieving the top scores.

### Technical Stack
- **Backend Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **API Format**: RESTful JSON API

### Database Schema
#### High Scores Table
- `id`: Integer (Primary Key, Auto-increment)
- `name`: String (Player's name)
- `score`: Integer (Player's score)
- `created_at`: Timestamp (When the record was created)

### API Endpoints

#### 1. Submit High Score
- **Endpoint**: `POST /api/highscores`
- **Purpose**: Add a new high score to the database
- **Request Body**:
  ```json
  {
    "name": "string",
    "score": "integer"
  }
  ```
- **Required Fields**: `name` and `score`
- **Response**:
  - Success (201 Created):
    ```json
    {
      "id": "integer",
      "name": "string",
      "score": "integer",
      "created_at": "timestamp"
    }
    ```
  - Error (400 Bad Request): If request body is invalid
  - Error (500 Internal Server Error): If server encounters an error

#### 2. Get Top High Scores
- **Endpoint**: `GET /api/highscores`
- **Purpose**: Retrieve the top 100 high scores, sorted by score (descending)
- **Query Parameters**: None required
- **Response**:
  - Success (200 OK):
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
  - Error (500 Internal Server Error): If server encounters an error

### Implementation Requirements

1. **Project Structure**
   - Follow a modular approach with separate folders for routes, controllers, models, and database configuration

2. **Error Handling**
   - Implement proper error handling with appropriate HTTP status codes and error messages

3. **Input Validation**
   - Validate all input data before processing
   - Ensure `name` is a non-empty string
   - Ensure `score` is a positive integer

4. **Database**
   - Implement efficient querying to retrieve top 100 scores
   - Use connection pooling for database connections
   - Implement proper indexing for optimized sorting and querying

5. **Scalability Considerations**
   - Design the system to handle potential high traffic
   - Implement rate limiting to prevent abuse

### Development Steps
1. Set up the Node.js project with TypeScript
2. Configure PostgreSQL database
3. Create database schema
4. Implement API endpoints
5. Add input validation
6. Implement error handling
7. Test the API endpoints
8. Deploy the service
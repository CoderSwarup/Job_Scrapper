# Job Scraper

A web scraper and API service to gather and serve job opportunities from the careers pages of Microsoft, Google, and Amazon. The job postings are stored in a database, and an API serves this data to users with robust mechanisms to handle duplicates and ensure data consistency.

---

## Features

1. **Web Scraping**: Collects job postings from Microsoft, Google, and Amazon.
2. **Duplicate Prevention**:
   - Uses unique identifiers (job URL or hash of attributes).
   - Implements database constraints to avoid duplicate entries.
   - Compares timestamps to update existing entries.
3. **API Service**:
   - Serves job data to users.
   - Filters out duplicates in API responses if any exist.
4. **Job Queue Management**:
   - Uses Redis and BullMQ to process job chunks.
5. **Docker Integration**: Easily set up Redis using Docker Compose.

---

## Video Sample

https://github.com/user-attachments/assets/08f8c550-6319-49ed-99bc-c03dbd63f0bb



## Prerequisites

1. **Node.js**: Install [Node.js](https://nodejs.org/).
2. **MongoDB**: Set up a local or cloud MongoDB instance.
3. **Docker**: Install [Docker](https://www.docker.com/).
4. **Redis**: Ensure Redis is available, either natively or via Docker.

---

## Environment Variables

Configure the following environment variables in a `.env` file:

```env
PORT=3000
MONGO_URL='mongodb://localhost:27017/job_scrapper'
JOB_FETCH_LIMIT=70
JOB_CHUNK_SIZE=50
REDIS_URL="redis://<YOUR_IP>:6379"
QUEUE_NAME="JOB_QUEUE"
```

---

## Project Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/CoderSwarup/Job_Scrapper.git
cd Job_Scrapper-api
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up MongoDB

Ensure MongoDB is running locally or provide the connection string to a cloud instance in the `.env` file.

### Step 4: Set Up Redis Using Docker Compose

The project includes a `docker-compose.yml` file for setting up Redis.

```yaml
version: '3.9'

services:
  redis-stack:
    image: redis/redis-stack:latest
    container_name: redis-server
    ports:
      - '6379:6379' # Redis server port
      - '8001:8001' # RedisInsight UI port
```

To start the Redis server, execute the following command:

```bash
docker-compose up -d
```

### Step 5: Start the Project

Run the following command to start the application:

```bash
npm run dev
```

---

## API Endpoints

### Base URL

`http://localhost:3000`

### Endpoints

1. **Get All Jobs**

   - **Endpoint**: `/api/v1/job`
   - **Method**: `GET`
   - **Query Parameters**:
     - `limit`: Number of jobs to fetch (default: 10).
     - `page`: Page number for pagination (default: 1).
     - `search`: Search term for filtering jobs by keyword (optional).
     - `location`: Location to filter jobs by (optional).
     - `company`: Company name to filter jobs by (required).
     - `sortBy`: Field to sort the results by (default: `createdAt`).
     - `sortOrder`: Sort order for the results (default: `desc`).
   - **Example**:

     ```bash
     curl "http://localhost:3000/api/v1/job?page=1&limit=10&company=GOOGLE&sortBy=createdAt&sortOrder=asc"
     ```

   This example retrieves a list of jobs from the `GOOGLE` company, filtered by the keyword "developer" and location "Seattle," sorted by creation date in ascending order.

---

2. **Remove Duplicate Jobs**

   - **Endpoint**: `/api/v1/job/delete-duplicate`
   - **Method**: `GET`
   - **Description**: This endpoint removes duplicate job entries from the database.
   - **Example**:

     ```bash
     curl "http://localhost:3000/api/v1/job/delete-duplicate"
     ```

   This example deletes duplicate job entries from the database.

---

#### For More Use This Postman Collection [PostManCollection.json](PostManCollection.json)

---

## Challenges & Solutions

### 1. Preventing Duplicate Data

#### Strategy:

1. **Unique Identifiers**:

   - Use the job URL or a hash of key attributes (`job title + location + company`) as a unique identifier.
   - Check for existing records before inserting new ones.

2. **Timestamp Comparison**:

   - Update existing entries if the job posting has a more recent timestamp.

3. **Database Constraints**:

   - Use a unique index on the job URL or computed hash column in the database.

4. **API-Level Filtering**:
   - Filter out duplicates before serving data to users.

---

## Development Workflow

1. **Publishing Job Chunks**:

   - Job postings are split into chunks (based on `JOB_CHUNK_SIZE`) and added to a Redis-backed queue.

2. **Worker Processing**:

   - A worker processes these job chunks and inserts them into the database.

3. **API Response**:
   - Data is served cleanly via RESTful API endpoints.

---

## Sample Docker Commands

### Start Redis

```bash
docker-compose up -d
```

### Stop Redis

```bash
docker-compose down
```

---

## Technologies Used

1. **Node.js**: Backend runtime.
2. **MongoDB**: Database for storing job postings.
3. **Redis & BullMQ**: Queue management for scraping tasks.
4. **Docker**: Containerization for Redis setup.
5. **Express.js**: API framework.

---

## Contributions

Feel free to fork the repository, create a branch, and submit a pull request for improvements or bug fixes.

---

# HAPPY CODING 💖🚀👨🏻‍💻

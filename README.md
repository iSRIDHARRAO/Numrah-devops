# Fadfed Chat Application - Backend

Fadfed is a real-time chatting application that randomly matches connected users in private conversations. This mini project aims to develop a simplified version of the Fadfed backend, mirroring its microservices architecture with multiple Node.js services.

## Project Setup

### Set Up the .env File

Create a file named `.env` in the src folder and add the following configurations:

```
ENV=dev
API_SERVER_PORT=3000
CHAT_SERVER_PORT=3001
DB_USER='username'
DB_HOST='postgresql'
DB_NAME='fadfed'
DB_PASSWORD='password'
DB_PORT=5432
ACCESS_TOKEN_SECRET=123456
REFRESH_TOKEN_SECRET=654321
NATS_URL=nats:4222
```

Adjust the values accordingly based on your environment.

## Services Overview

1. API Server

    The API server handles user authentication, registration, and other user-related functionalities. It runs on the port specified in API_SERVER_PORT in the .env file.

2. Chat Server

    The chat server manages real-time communication between connected users. It randomly matches users for private conversations. It runs on the port specified in CHAT_SERVER_PORT in the .env file.

3. Spam Detector Service

    The Spam Detector Service is a specialized microservice used to detect and handle spam content in messages. It analyzes messages passed through the chat service and ban users accordingly.

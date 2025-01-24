# DevOps Assignment: Fadfed Chat Application - Backend

This assignment is designed to evaluate your DevOps skills by simulating the setup of a real-world microservices architecture. You’ll work with a backend API repository consisting of three microservices built with Node.js, and you will be required to create a production-ready deployment environment.

Fadfed is a real-time chatting application that randomly matches connected users in private conversations. This mini project aims to develop a simplified version of the Fadfed backend, mirroring its microservices architecture with multiple Node.js services.

## Services Overview

1. **API Server**

    The API server handles user authentication, registration, and other user-related functionalities. It runs on the port specified in `API_SERVER_PORT` in the `.env` file.

2. **Chat Server**

    The chat server manages real-time communication between connected users. It randomly matches users for private conversations. It runs on the port specified in `CHAT_SERVER_PORT` in the `.env` file.

3. **Spam Detector Service**

    The Spam Detector Service is a specialized microservice used to detect and handle spam content in messages. It analyzes messages passed through the chat service and bans users accordingly.

## Task Objectives

You are required to perform the following tasks:

### Containerization

- Create individual Dockerfiles for the three microservices (API Server, Chat Server, and Spam Detector Service) ensuring lightweight images, security best practices, and multi-stage builds (where applicable).
- Create a `docker-compose.yml` file to orchestrate the services locally. The project dependencies include:
    - NATS (as the message broker)
    - PostgreSQL (as the database)

### Kubernetes Deployment

- Write Kubernetes deployment and service YAML files for:
    - API Server
    - Chat Server
    - Spam Detector Service
    - NATS (using a deployment file)
- Write a StatefulSet YAML file for PostgreSQL, ensuring persistent data storage.

### CI/CD Pipeline

- Create `cloudbuild.yaml` files for:
    - Building and pushing Docker images for each microservice to a container registry (e.g., Google Container Registry or DockerHub).
    - Deploying the services to Kubernetes.

### Infrastructure as Code (IaC)

- Use Terraform to define infrastructure resources:
    - A Kubernetes cluster (e.g., GKE, EKS, or AKS).
    - Networking (VPC, subnets, etc., if applicable).
    - Persistent storage for PostgreSQL.
    - Required IAM roles and service accounts.

### Centralized Logging and Monitoring

- **Logging**: Set up an ELK stack (Elasticsearch, Logstash, Kibana):
    - Configure the services to send logs to Logstash.
    - Index the logs in Elasticsearch and create a basic Kibana dashboard to visualize service logs.
- **Monitoring**: Set up Prometheus and Grafana:
    - Install Prometheus and configure it to monitor service metrics.
    - Use Grafana to visualize these metrics through a dashboard.

### Documentation

- Provide a clear `README.md` file describing:
    - Steps to build and run the project locally using Docker Compose.
    - Steps to deploy the project to Kubernetes.
    - How to use Terraform for infrastructure setup.
    - How to access ELK and Grafana dashboards.
- (Optional) Create a video recording to showcase your work.

## Project Setup

### Set Up the .env File

Create a file named `.env` in the `src` folder and add the following configurations:

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

## Evaluation Criteria

- **Code Quality**: Dockerfiles, Kubernetes manifests, and Terraform configurations should be clean, modular, and follow best practices.
- **Completeness**: All services must be containerized, orchestrated, and deployable to Kubernetes.
- **Documentation**: Clear and concise instructions are essential for running and deploying the project.
- **Logging and Monitoring**: Effective integration of ELK and Prometheus/Grafana.
- **CI/CD**: Properly defined pipelines that build, test, and deploy the services.
- **Git Commits**: Use of conventional commits for a clean and structured commit history.

Feel free to reach out if you have any questions and best of luck!!!
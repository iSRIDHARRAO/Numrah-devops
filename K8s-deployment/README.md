# Setup kubectl client with GKE

In order to setup kubectl client command to connect with GKE cluster follow below steps :-
1. Activate service account 
```bash
gcloud auth activate-service-account --key-file=YOUR_SERVICE_ACCOUNT_KEY_FILE.json
```
2. Setup the project
```bash
gcloud config set project YOUR_PROJECT_ID
```
3. Get GKE credentials
```bash
gcloud container clusters get-credentials YOUR_CLUSTER_NAME --region YOUR_CLUSTER_REGION --project YOUR_PROJECT_ID
```
# Deployment Order and Installation Instructions

This guide explains how to deploy the components in the correct order based on the dependency graph. The components involved are:

1. **PostgreSQL**
2. **NATS**
3. **API Servers**: 
   - api-server
   - chat-server
   - spam-service
4. **Grafana**

## Dependency Graph
The order of deployment should follow the dependency hierarchy outlined below:

1. **PostgreSQL**: The database must be deployed first as other services may depend on it for data storage.
2. **NATS**: This messaging system will be used by API servers, so it should be deployed next.
3. **API Servers**: Deploy the API servers, which include:
   - `api-server`
   - `chat-server`
   - `spam-service`
4. **Grafana**: Deploy Grafana for monitoring once the core services are running.
5. **Prometheus**: Deploy Prometheus next, as it will need to collect metrics from the Grafana setup.
6. **ELK Stack**: Finally, deploy Elasticsearch, Logstash, and Kibana for logging and monitoring.

## Installation Process

Each component dir have its own instructions to deploy.

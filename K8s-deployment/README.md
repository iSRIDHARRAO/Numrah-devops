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

## Replace Placeholders in `pv.yaml`

Before deploying the components, you need to replace the placeholders in the `pv.yaml` files.

### Steps for Grafana `pv.yaml`:
1. Locate the `grafana/manifests/pv.yaml` file.
2. Replace the following placeholders:
   - `<file-store-region>`: The region where your file store is located.
   - `<file-store-name>`: The name of your file store.
   - `<file-share-name>`: The name of the file share.
   - `<file-store-ip>`: The IP address of your file store.
   - `<size>`: The required size of the persistent volume (e.g., `10Gi`).

### Steps for PostgreSQL `pv.yaml`:
1. Locate the `postgres/manifests/pv.yaml` file.
2. Replace the following placeholders:
   - `<file-store-region>`: The region where your file store is located.
   - `<file-store-name>`: The name of your file store.
   - `<file-share-name>`: The name of the file share.
   - `<file-store-ip>`: The IP address of your file store.
   - `<size>`: The required size of the persistent volume (e.g., `10Gi`).

After replacing the placeholders, save the updated files.

## Installation Process

Once the `pv.yaml` files are updated, follow the steps below to install each component in the proper order:

### 1. PostgreSQL
Run the `install.sh` script in the PostgreSQL directory:
```bash
cd postgres
./install.sh
```
### 2. NATS
Run the `install.sh` script in the NATS directory:
```bash
cd nats
./install.sh
```
### 3. API Servers (`api-server`,`chat-server` and `spam-service`)
Run the `install.sh` script in the each dir directory:
```bash
cd numrah-spi-services/api-server
./install.sh

cd numrah-spi-services/chat-server
./install.sh

cd numrah-spi-services/spam-service
./install.sh
```
### 4. Grafana ( for visualization of metrics )
Run the `install.sh` script in the grafana directory:
```bash
cd postgres
./install.sh
```
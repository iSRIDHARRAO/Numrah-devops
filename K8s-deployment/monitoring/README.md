# Grafana and Prometheus Deployment Guide

This guide will help you deploy Grafana and Prometheus on your Kubernetes cluster using `install.sh`. Follow the steps below to configure everything, including accessing Grafana, logging in, and setting up Prometheus as a data source.

## Prerequisites

Before you begin, ensure the following:
- You have a Kubernetes cluster running and `kubectl` configured.
- The `install.sh` script is available in your project directory.
- You have access to create Ingress and services in the `monitoring` namespace.

## Steps to Deploy Grafana and Prometheus

### 1. Modify `manifests/pv.yaml`

Before running `install.sh`, ensure that you update all placeholders in `manifests/pv.yaml`:

#### Replace Placeholders in `pv.yaml`

Before deploying the components, you need to replace the placeholders in the `pv.yaml` files.

1. Locate the `manifests/pv.yaml` file.
2. Replace the following placeholders:
   - `<file-store-region>`: The region where your file store is located.
   - `<file-store-name>`: The name of your file store.
   - `<file-share-name>`: The name of the file share.
   - `<file-store-ip>`: The IP address of your file store.
   - `<size>`: The required size of the persistent volume (e.g., `10Gi`).

    After replacing the placeholders, save the updated files.

### 2. Run the `install.sh` Script

Once `pv.yaml` is updated, you can proceed with the deployment. Execute the following command to deploy Grafana and Prometheus:

```bash
./install.sh
```

This script will:
- Install Prometheus and Grafana in the `monitoring` namespace.
- Create necessary services and resources.
- Set up Ingress to expose Grafana.

### 3. Wait for External IP

After running the `install.sh`, the ingress will be created for Grafana. Use the following command to monitor the creation of the external IP:

```bash
kubectl get ingress -n monitoring
```

Wait until the `EXTERNAL-IP` for `grafana-ingress` is assigned.

### 4. Access Grafana

Once the external IP is available, open a browser and navigate to:

```
http://<EXTERNAL-IP>/
```

### 5. Login to Grafana

Grafana's default login credentials are as follows:
- **Username**: `admin`
- **Password**: Retrieve the password from the secret:

```bash
kubectl get secret grafana-secret -n monitoring -o jsonpath='{.data.GF_SECURITY_ADMIN_PASSWORD}' | base64 --decode
```

Use these credentials to log in to the Grafana dashboard.

### 6. Configure Prometheus as a DataSource

After logging in, configure Prometheus as the data source in Grafana:

1. From the Grafana dashboard, click on the **Configuration** gear icon in the left menu.
2. Select **Data Sources** and then click **Add data source**.
3. Choose **Prometheus** from the list of available data sources.
4. In the **HTTP** section, set the URL to your Prometheus service:

   ```
   http://prometheus-server.monitoring.svc:80
   ```

5. Click **Save & Test** to verify the connection.

Now, Prometheus will be available as a data source, and you can start building dashboards.

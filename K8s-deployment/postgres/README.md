# Postgres Guide

This guide will help you deploy Postgres on your Kubernetes cluster using `install.sh`. 

## Prerequisites

Before you begin, ensure the following:
- You have a Kubernetes cluster running and `kubectl` configured.
- The `install.sh` script is available in your project directory.
- You have access to create Ingress and services in the `monitoring` namespace.

## Steps to Deploy Postgres

### 1. Modify `manifests/pv.yaml`

Before running `install.sh`, ensure that you update all placeholders in `manifests/pv.yaml`:

#### Replace Placeholders in `pv.yaml`

Before deploying the components, you need to replace the placeholders in the `pv.yaml` files.

1. Locate the `postgres/manifests/pv.yaml` file.
2. Replace the following placeholders:
   - `<file-store-region>`: The region where your file store is located.
   - `<file-store-name>`: The name of your file store.
   - `<file-share-name>`: The name of the file share.
   - `<file-store-ip>`: The IP address of your file store.
   - `<size>`: The required size of the persistent volume (e.g., `10Gi`).

    After replacing the placeholders, save the updated files.

### 2. Run the `install.sh` Script


```bash
./install.sh
```

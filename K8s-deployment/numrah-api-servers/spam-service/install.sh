#!/bin/bash

# Apply Kubernetes manifests
kubectl apply -f manifests/deployment.yaml

echo "Deployment completed successfully."

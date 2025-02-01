#!/bin/bash


# Apply Kubernetes manifests
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml
kubectl apply -f manifests/ingress.yaml

echo "Deployment completed successfully."

#!/bin/bash

NAMESPACE="numrah"
SECRET_NAME="numrah-secret"
ENV_FILE="../.env"

kubectl create ns $NAMESPACE
# Ensure the .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE file not found!"
  exit 1
fi


# Check if the secret exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &>/dev/null; then
  echo "Secret $SECRET_NAME already exists. Updating..."
  kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE"
fi

# Create the secret
kubectl create secret generic $SECRET_NAME --from-file=$ENV_FILE -n $NAMESPACE
echo "Secret $SECRET_NAME created successfully."

# Apply Kubernetes manifests
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml
kubectl apply -f manifests/ingress.yaml

echo "Deployment completed successfully."

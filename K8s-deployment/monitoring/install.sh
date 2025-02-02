#!/bin/bash

PASSWORD_FILE="grafana-password"
SECRET_NAME="grafana-secret"
NAMESPACE="monitoring"

kubectl create ns $NAMESPACE
# Check if password file exists
if [ ! -f "$PASSWORD_FILE" ]; then
  # Generate password and store it in the file
  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 16 > "$PASSWORD_FILE"
  echo "Generated new password and saved to $PASSWORD_FILE"
fi

# Read password from file
GRAFANA_PASSWORD=$(cat "$PASSWORD_FILE")

# Check if the secret already exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &>/dev/null; then
  echo "Secret $SECRET_NAME already exists in namespace $NAMESPACE. Skipping creation."
else
  # Create Kubernetes secret
  kubectl create secret generic "$SECRET_NAME" -n "$NAMESPACE" \
    --from-literal=GF_SECURITY_ADMIN_PASSWORD="$GRAFANA_PASSWORD" \

  echo "Secret $SECRET_NAME created successfully in namespace $NAMESPACE."
  kubectl apply -f manifests/pv.yaml
  kubectl apply -f manifests/pvc.yaml
  kubectl apply -f manifests/deployment.yaml
  kubectl apply -f manifests/service.yaml
  kubectl apply -f manifests/ingress.yaml
  helm install prometheus prometheus-community/prometheus --namespace monitoring
fi



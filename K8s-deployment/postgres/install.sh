#!/bin/bash
#!/bin/bash

PASSWORD_FILE="postgres-password"
SECRET_NAME="postgres-secret"
NAMESPACE="postgres"
ENV_FILE=../numrah-api-servers/.env
EXAMPLE_ENV=../numrah-api-servers/example.env

kubectl create ns postgres
# Check if password file exists
if [ ! -f "$PASSWORD_FILE" ]; then
  # Generate password and store it in the file
  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 16 > "$PASSWORD_FILE"
  cp $EXAMPLE_ENV $ENV_FILE
  sed -i.bak "s|<db_password>|$POSTGRES_PASSWORD|g" "$ENV_FILE"
  echo "Generated new password and saved to $PASSWORD_FILE"
fi

# Read password from file
POSTGRES_PASSWORD=$(cat "$PASSWORD_FILE")

# Check if the secret already exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &>/dev/null; then
  echo "Secret $SECRET_NAME already exists in namespace $NAMESPACE. Skipping creation."
else
  # Create Kubernetes secret
  kubectl create secret generic "$SECRET_NAME" -n "$NAMESPACE" \
    --from-literal=POSTGRES_USER=postgres \
    --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    --from-literal=POSTGRES_DB=postgres
  kubectl apply -f manifests/configmap.yaml
  kubectl apply -f manifests/pv.yaml
  kubectl apply -f manifests/statefulset.yaml
  kubectl apply -f manifests/service.yaml


  echo "Secret $SECRET_NAME created successfully in namespace $NAMESPACE."
fi
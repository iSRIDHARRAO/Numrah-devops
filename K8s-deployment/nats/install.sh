#!/bin/bash

kubectl create ns nats
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml
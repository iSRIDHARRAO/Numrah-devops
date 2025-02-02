# Cloud Build Pipeline Overview

This pipeline is triggered based on a trigger created by Cloud Build after establishing a host connection to the GitHub repository and creating a virtual repository in Cloud Build. Based on the defined rules, this pipeline will:

- Build Docker images.
- Push the images to Artifact Registry.
- Deploy the images to Google Kubernetes Engine (GKE).


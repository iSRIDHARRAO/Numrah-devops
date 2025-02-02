# Infrastructure Deployment with Terraform on Google Cloud

This guide provides step-by-step instructions to configure Google Cloud CLI, authenticate with a service account, initialize Terraform with a remote backend, and deploy infrastructure using Terraform.

---

## Prerequisites

Before proceeding, ensure you have the following installed on your system:

- [Terraform](https://developer.hashicorp.com/terraform/downloads)
- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install)
- A Google Cloud service account with the necessary IAM permissions
- `backend.conf` file for configuring Terraform remote state storage
- `prod/terraform.tfvars` file containing environment-specific variables

---

## 1. Configure Google Cloud CLI

### **Authenticate with a Service Account**
1. Download the service account JSON key file from Google Cloud IAM.
2. Activate the service account using the key file:

   ```bash
   gcloud auth activate-service-account --key-file=YOUR_SERVICE_ACCOUNT_KEY_FILE.json
   ```

3. Verify authentication:

   ```bash
   gcloud auth list
   ```

### **Set the Google Cloud Project**
Replace `<YOUR_PROJECT_ID>` with your actual Google Cloud project ID:

```bash
gcloud config set project <YOUR_PROJECT_ID>
```


### **Verify Access to Google Cloud Storage**
If Terraform is using Google Cloud Storage as a backend, authenticate the application:

```bash
gcloud auth application-default login
```

---

## 2. Initialize Terraform

Once `gcloud` is configured, initialize Terraform with the backend configuration:

```bash
terraform init -backend-config=backend.conf
```

This command:
- Downloads necessary provider plugins
- Configures the backend for storing Terraform state remotely

---

## 3. Plan the Deployment

Before applying changes, review the execution plan:

```bash
terraform plan -var-file=prod/terraform.tfvars
```

This command:
- Shows what Terraform will create, modify, or destroy
- Uses the `prod/terraform.tfvars` file to load required variables

---

## 4. Apply the Changes

Once you've reviewed the plan, apply the configuration to deploy the infrastructure:

```bash
terraform apply -var-file=prod/terraform.tfvars
```

This command:
- Provisions resources as defined in the Terraform configuration files
- Requires manual confirmation before proceeding

For an automated deployment, use the `-auto-approve` flag:

```bash
terraform apply -var-file=prod/terraform.tfvars -auto-approve
```

---

## 5. Required Files

Ensure the following files are present before running Terraform:

- **`backend.conf`**: Defines remote state storage settings (e.g., Google Cloud Storage bucket).
- **`prod/terraform.tfvars`**: Contains environment-specific variable values.
- **`main.tf`**: Terraform configuration file defining resources.
- **`variables.tf`**: Defines input variables required for deployment.
- **`outputs.tf`**: Specifies output values to retrieve after deployment.

---

## 6. Verifying Deployment

After applying Terraform, verify deployed resources using:

```bash
terraform output
```

For Google Cloud resources, check using `gcloud`:

```bash
gcloud compute instances list
```

---

## 7. Destroying Resources

To tear down the deployed infrastructure:

```bash
terraform destroy -var-file=prod/terraform.tfvars
```

Use this command with caution, as it will remove all resources.

---

By following these steps, you can efficiently manage infrastructure on Google Cloud using Terraform while ensuring security and remote state management.
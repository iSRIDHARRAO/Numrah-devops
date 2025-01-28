terraform {
  backend "gcs" {
    prefix = "terraform/prod/terraform.tfstate"
  }
}

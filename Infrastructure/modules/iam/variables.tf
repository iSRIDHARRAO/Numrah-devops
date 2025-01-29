variable "name" {
  description = "The name of the service account"
  type        = string
}

variable "display_name" {
  description = "The display name of the service account"
  type        = string
}

variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "role" {
  description = "The IAM role to bind to the service account"
  type        = string
  default     = "roles/container.defaultNodeServiceAccount"
}

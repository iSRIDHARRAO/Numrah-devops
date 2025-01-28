variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}

variable "location" {
  description = "The location (region or zone) of the cluster"
  type        = string
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "network" {
  description = "The VPC network name"
  type        = string
}

variable "subnetwork" {
  description = "The subnetwork name"
  type        = string
}

variable "initial_node_count" {
  description = "The initial number of nodes in the cluster"
  type        = number
  default     = 3
}

variable "service_account_email" {
  description = "The service account email to use for the GKE cluster nodes"
  type        = string
}

variable "node_count" {
  type = string
}

variable "node_machine_type" {
  type = string
}
variable "node_pool_name" {
  type = string
}


variable "gke_master_cidr" {
    type = string
}
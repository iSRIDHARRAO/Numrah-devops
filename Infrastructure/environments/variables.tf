variable "project_name" {
  type = string  
}

variable "project_id" {
  type = string  
}

variable "region" {
  type = string  
}

variable "repository_names" {
  description = "A list of Artifact Registry repository names."
  type        = list(string)
}

variable "location" {
  type = string  
}


variable "role" {
  type = string
  
}
variable "gke_cluster_name" {
  type = string
  
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

variable "filestore_instances" {
  type = map(object({
    filestore_name             = string
    instance_description       = string
    tier              = string
    networks          = object({
      modes   = string
      connect_mode = string
    })
    file_shares       = object({
      name          = string
      capacity_gb   = number
      nfs_export_options = object({
        ip_ranges = list(string)
        access_mode = string
        squash_mode = string
      })
    })
    })
  )
}

variable "artifact_registry_role" {
  type = string
  default = "roles/artifactregistry.reader"
  
}

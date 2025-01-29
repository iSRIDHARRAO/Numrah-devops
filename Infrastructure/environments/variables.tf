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


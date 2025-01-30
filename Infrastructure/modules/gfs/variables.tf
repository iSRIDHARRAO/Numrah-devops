variable "project_id" {
  type        = string
  description = "The ID of the Google Cloud project to use."
}

variable "zone" {
  type        = string
  description = "The zone in which to create the Filestore instance."
}

variable "filestore_name" {
  type        = string
  description = "The name to give the Filestore instance."
}


variable "instance_description" {
  type        = string
  description = "The description to give the Filestore instance."
}

variable "tier" {
  type        = string
  description = "The tier of the Filestore instance."
}

variable "file_shares" {
  type        = object({
      name          = string
      capacity_gb   = number
      nfs_export_options = object({
        ip_ranges = list(string)
        access_mode = string
        squash_mode = string
      })
    })
  description = "The file share configuration for the Filestore instance."
}


variable "networks" {
  type        = object({
      modes   = string
      connect_mode = string
    })
  description = "The network information for the Filestore instance."
}

variable "network_name" {
  type = string
}
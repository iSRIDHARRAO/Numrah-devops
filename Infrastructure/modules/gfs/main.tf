resource "google_filestore_instance" "filestore_instance" {
  name        = var.filestore_name
  description = var.instance_description
  project     = var.project_id
  location    = var.zone
  tier        = var.tier
  networks {
    network = var.network_name
    modes   = [var.networks.modes]
    connect_mode = var.networks.connect_mode 
  }
  file_shares {
    name          = var.file_shares.name
    capacity_gb   = var.file_shares.capacity_gb
    nfs_export_options {
      access_mode = var.file_shares.nfs_export_options.access_mode
      squash_mode = var.file_shares.nfs_export_options.squash_mode
      ip_ranges = var.file_shares.nfs_export_options.ip_ranges
    }
  }
}
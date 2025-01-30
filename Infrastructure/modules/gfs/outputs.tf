output "instance_name" {
  value = google_filestore_instance.filestore_instance.name
}

output "ip_address" {
  value = google_filestore_instance.filestore_instance.networks[0].ip_addresses[0]
}
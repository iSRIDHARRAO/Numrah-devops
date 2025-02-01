resource "google_compute_instance" "bastion" {
  name         = "numrah-prod-bastion"
  machine_type = "e2-micro"  
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"  
    }
  }

  network_interface {
    network    = var.vpc_id
    subnetwork = var.subnetwork_id
    access_config {}  
  }

  metadata = {
  }

  tags = ["bastion"]
}
resource "google_compute_network" "vpc" {
  name                    = var.vpc_name
  project = var.project_id
  auto_create_subnetworks = false
}



resource "google_compute_subnetwork" "public_subnet" {
  name          = "public-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.0.0/24"

}


resource "google_compute_subnetwork" "private_subnet" {
  name          = "private-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.1.0/24"
  private_ip_google_access = true
}

resource "google_compute_router" "vpc_router" {
  name    = "vpc-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "vpc_nat" {
  name   = "vpc-nat"
  region = var.region
  router = google_compute_router.vpc_router.name

  nat_ip_allocate_option = "AUTO_ONLY"

  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
  subnetwork {
    name = google_compute_subnetwork.private_subnet.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
}
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
  depends_on = [ google_compute_network.vpc ]

}


resource "google_compute_subnetwork" "private_subnet" {
  name          = "private-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.1.0/24"
  private_ip_google_access = true
  depends_on = [ google_compute_network.vpc ]
}

resource "google_compute_router" "vpc_router" {
  name    = "vpc-router"
  region  = var.region
  network = google_compute_network.vpc.id
  depends_on = [ google_compute_subnetwork.private_subnet,google_compute_subnetwork.public_subnet ]
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
  depends_on = [ google_compute_router.vpc_router ]
}

resource "google_compute_firewall" "allow_ingress" {
  name    = "allow-ingress"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80","2049","22"]
  }

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
    depends_on = [ google_compute_router_nat.vpc_nat ]
}

resource "google_compute_firewall" "allow_egress" {
  name    = "allow-egress"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
    depends_on = [ google_compute_router_nat.vpc_nat ]
}

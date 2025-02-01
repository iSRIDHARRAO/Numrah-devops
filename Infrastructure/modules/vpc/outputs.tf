output "vpc_id" {
  value = google_compute_network.vpc.id
}

output "public_subnet_id" {
  value = google_compute_subnetwork.public_subnet.id
}

output "private_subnet_id" {
  value = google_compute_subnetwork.private_subnet.id
}
output "router_id" {
  value = google_compute_router.vpc_router.id
}

output "firewall_id" {
  value = google_compute_firewall.allow_ingress
}

output "vpc_name" {
    value = google_compute_network.vpc.name
  
}
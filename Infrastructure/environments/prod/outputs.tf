output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_id" {
  value = module.vpc.public_subnet_id
}

output "private_subnet_id" {
  value = module.vpc.private_subnet_id
}
output "router_id" {
  value = module.vpc.router_id
}

output "firewall_id" {
  value = module.vpc.firewall_id
}

output "repository_urls" {
  value = module.artifact-registry.repository_urls
}
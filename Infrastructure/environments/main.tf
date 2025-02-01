module "vpc" {
    source = "../modules/vpc"
    vpc_name =  "numrah-devops"
    project_id = var.project_id
    region = var.location
}

module "artifact-registry" {
    source = "../modules/artifact-registry"
    location = var.location
    project_id = var.project_id
    repository_names = var.repository_names
    depends_on = [ module.vpc ]
}

module "iam" {
    source = "../modules/iam"
    name = "k8s_sa"
    display_name = "k8s_sa"
    project_id = var.project_id
    depends_on = [ module.vpc ]
    role = var.role
    artifact_registry_role = var.artifact_registry_role
  
}
module "gke" {
    source = "../modules/gke"
    location = var.location
    service_account_email = module.iam.service_account_email
    cluster_name = var.gke_cluster_name
    project_id = var.project_id
    network = module.vpc.vpc_id
    subnetwork = module.vpc.private_subnet_id
    node_count = var.node_count
    node_machine_type = var.node_machine_type
    node_pool_name = var.node_pool_name
    gke_master_cidr = var.gke_master_cidr
    depends_on = [ module.iam ]
}

module "filestore_instance" {
  source = "../modules/gfs"
  for_each    = var.filestore_instances
  filestore_name   = each.value.filestore_name
  instance_description = each.value.instance_description
  project_id  = var.project_id
  zone        = var.location
  tier        = each.value.tier
  networks    = each.value.networks
  file_shares = each.value.file_shares
  network_name          = module.vpc.vpc_name
  depends_on = [ module.vpc ]
}
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
}

module "iam" {
    source = "../modules/iam"
    name = "k8s_sa"
    display_name = "k8s_sa"
    project_id = var.project_id
  
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
}

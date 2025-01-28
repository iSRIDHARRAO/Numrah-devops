module "vpc" {
    source = "../../modules/vpc"
    vpc_name =  "numrah-devops"
    project_id = var.project_id
}

module "artifact-registry" {
    source = "../../modules/artifact-registry"
    location = var.location
    project_id = var.project_id
    repository_names = var.repository_names
}
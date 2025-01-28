module "vpc" {
  source = "../../modules/vpc"
  vpc_name =  "numrah-devops"
  project_id = var.project_id
}
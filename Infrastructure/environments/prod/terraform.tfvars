project_id = "tmp-devops"
project_name = "tmp-devops"
region = "asia-south-1"
location = "asia-south1"
repository_names = [ "api-server","chat-server","spam-service" ]
gke_cluster_name = "numrah-prod"
node_count       = 2
node_machine_type = "e2-standard-4"
node_pool_name = "gke-default-node-pool"
role = "roles/container.defaultNodeServiceAccount"

gke_master_cidr = "10.0.2.0/28"

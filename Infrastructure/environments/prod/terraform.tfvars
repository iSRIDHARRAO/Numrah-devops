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

filestore_instances = {
  "filestore-instance" = {
    filestore_name        = "gke-filestore"
    instance_description = "filestore instance used for testing terraform"
    tier        = "REGIONAL"
    networks    = {
      modes   = "MODE_IPV4"
      connect_mode = "DIRECT_PEERING"
    }
    file_shares =  {
      name          = "testfilestore"
      capacity_gb   = "1024"
      nfs_export_options = {
        ip_ranges = [ "10.0.2.0/28" ]
        access_mode = "READ_WRITE"
        squash_mode = "NO_ROOT_SQUASH"
      }
    }
  }
}
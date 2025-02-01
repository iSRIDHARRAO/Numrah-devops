resource "google_container_cluster" "gke" {
  name = var.cluster_name
  location = var.location
  deletion_protection = false
  remove_default_node_pool = true
  initial_node_count = 1
  network = var.network
  subnetwork = var.subnetwork
  logging_service = "none"
  monitoring_service = "none"
  networking_mode = "VPC_NATIVE"

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    gcp_filestore_csi_driver_config{
      enabled = true
    }
  }

  release_channel {
    channel = "REGULAR"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  private_cluster_config {
    enable_private_nodes = true
    enable_private_endpoint = false
    master_ipv4_cidr_block = var.gke_master_cidr
  }
}


resource "google_container_node_pool" "gke-default-nodepool" {
  name = var.node_pool_name
  cluster = google_container_cluster.gke.id
  node_count = var.node_count

  management {
    auto_repair = true
    auto_upgrade = true
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 2
    location_policy = "BALANCED"
  }

  node_config {
    preemptible = false
    machine_type = var.node_machine_type

    labels = {
      role = "general"
    }

    service_account = var.service_account_email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
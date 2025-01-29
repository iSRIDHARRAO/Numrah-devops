
resource "google_service_account" "kubernetes" {
  account_id = "kubernetes"
}

resource "google_project_iam_binding" "service_account_role_binding" {
  project = var.project_id
  role    = var.role

  members = [
    "serviceAccount:${google_service_account.kubernetes.email}"
  ]
}

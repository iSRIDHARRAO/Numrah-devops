resource "google_artifact_registry_repository" "docker_repositories" {
  for_each = toset(var.repository_names)
  repository_id = each.key
  location = var.location
  project  = var.project_id
  format   = "DOCKER"

}
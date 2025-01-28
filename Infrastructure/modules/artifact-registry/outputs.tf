output "repository_urls" {
  value = [ for repo in google_artifact_registry_repository.docker_repositories : repo.id  ]
}
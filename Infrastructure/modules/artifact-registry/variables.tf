
variable "repository_names" {
  description = "A list of Artifact Registry repository names."
  type        = list(string)
}

variable "location" {
  description = "The location to store the Artifact Registry repositories (e.g., us-central1)."
  type        = string
}

variable "project_id" {
    type = string
  
}

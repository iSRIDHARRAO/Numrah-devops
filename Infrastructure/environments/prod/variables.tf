variable "project_name" {
  type = string  
}

variable "project_id" {
  type = string  
}

variable "region" {
  type = string  
}

variable "repository_names" {
  description = "A list of Artifact Registry repository names."
  type        = list(string)
}

variable "location" {
  type = string  
}
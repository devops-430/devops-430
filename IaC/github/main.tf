provider "github" {
  token = var.github_token
}

variable "github_token" {
  type = string
}

variable "repository" {
  type = string
}   

variable "users" {
  type = list(string)
}

# variable "organization" {
#   type = string
# }

resource "github_repository" "temp-repo" {
#   organization = var.organization
  name = var.repository
}

resource "github_repository_collaborator" "collaborator" {
  repository = github_repository.temp-repo.name
  for_each = toset(var.users)
  username = each.value
  permission = "push"
}

output "collaborators" {
  value = github_repository_collaborator.collaborator
}

output "collaborator_ids" {
  value = {
    for collaborator in github_repository_collaborator.collaborator : collaborator.username => collaborator.id
  }
}

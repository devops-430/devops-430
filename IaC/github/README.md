###**add a list of users** to a **GitHub repository** (not just the organization) using **Terraform**.

In Terraform with the `github` provider, to **grant users access to a specific repository**, you use the resource:

```hcl
resource "github_team_repository" "example" { ... }
```
**OR** if you want to **add users directly** as collaborators (without a team), you use:

```hcl
resource "github_repository_collaborator" "example" { ... }
```

---
Since you said "list of users" and membership, **you probably want `github_repository_collaborator`.**

Here’s a clean Terraform example for **adding multiple users** to a repo:

### 1. Define your users list

```hcl
variable "users" {
  type    = list(string)
  default = ["user1", "user2", "user3"]  # GitHub usernames
}

variable "repository" {
  type    = string
  default = "your-repo-name"
}
```

---
### 2. Add users as collaborators

```hcl
resource "github_repository_collaborator" "add_users" {
  for_each = toset(var.users)

  repository = var.repository
  username   = each.key
  permission = "push"  # Options: pull, triage, push, maintain, admin
}
```

---
✅ This will **add each user** in the `users` list to your repository with `push` access (meaning they can push code but not manage settings).

---
### Full Working Example

```hcl
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token  # You should pass your GitHub token via variable/environment variable
}

variable "github_token" {}

variable "users" {
  type    = list(string)
  default = ["user1", "user2", "user3"]
}

variable "repository" {
  type    = string
  default = "your-repo-name"
}

resource "github_repository_collaborator" "add_users" {
  for_each = toset(var.users)

  repository = var.repository
  username   = each.key
  permission = "push"  # or "admin", "pull", etc.
}
```

---
### Important:
- The **GitHub token** (`github_token`) must have permission to **invite collaborators** to the repository.
- **Private repos** will **send invitation links**; users need to accept.
- **Public repos** can immediately add collaborators.
- The `permission` field can be one of:
  - `pull` (read-only access)
  - `triage` (lightweight manage access)
  - `push` (read/write access)
  - `maintain`
  - `admin`


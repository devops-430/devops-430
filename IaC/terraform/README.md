##  **supply variables** in several ways.
---

### 1. **`terraform.tfvars` file**
- You create a file named `terraform.tfvars` (or any `.tfvars` file) and define variables inside it:
```hcl
instance_type = "t2.micro"
region        = "us-east-1"
```
Terraform automatically picks this file when you run `terraform apply`.

---

### 2. **Directly in the CLI (`-var`)**
- You pass variables when running commands:
```bash
terraform apply -var="instance_type=t2.micro" -var="region=us-east-1"
```
This is useful for quick testing but not ideal for production.

---

### 3. **Environment variables**
- You set environment variables with the format `TF_VAR_<variable_name>`.
Example:
```bash
export TF_VAR_instance_type="t2.micro"
export TF_VAR_region="us-east-1"
terraform apply
```
Good for secret values like passwords.

---

### 4. **`-var-file` option**
- You can specify a particular `.tfvars` file:
```bash
terraform apply -var-file="production.tfvars"
```
Useful if you manage multiple environments (e.g., dev, prod).

---

### 5. **Default value in the `.tf` file**
- You can set a default inside the `variables.tf`:
```hcl
variable "instance_type" {
  type    = string
  default = "t2.micro"
}
```
If you don't supply a value, Terraform uses the default.

---

### Quick Example Putting It All Together

**variables.tf**
```hcl
variable "instance_type" {
  type = string
}

variable "region" {
  type = string
}
```

**terraform.tfvars**
```hcl
instance_type = "t3.small"
region        = "us-west-2"
```

Then simply run:
```bash
terraform init
terraform apply
```


## References

1. https://developer.hashicorp.com/terraform/language

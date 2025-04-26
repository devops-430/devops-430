variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 22.04"
  type        = string
  default     = "ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS in us-west-2
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "disk_size" {
  description = "Size of the root volume in GB"
  type        = number
  default     = 20
}

variable "security_group_ports" {
  description = "List of ports to open in security group"
  type        = list(number)
  default     = [80, 443, 8080]
}

variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 1
}

variable "instance_name" {
  description = "Name prefix for the EC2 instances"
  type        = string
  default     = "app-server"
}

variable "user_data_script" {
  description = "User data script to run on instance launch"
  type        = string
  default     = ""
} 
variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 1
}

variable "ami_id" {
  description = "The ID of the AMI to use for the instances"
  type        = string
}

variable "instance_type" {
  description = "The type of instance to create"
  type        = string
  default     = "t2.micro"
}

variable "subnet_id" {
  description = "The ID of the subnet where the instances will be created"
  type        = string
}

variable "key_name" {
  description = "The name of the key pair to use for the instances"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs to associate with the instances"
  type        = list(string)
}

variable "name_prefix" {
  description = "Prefix to use for instance names"
  type        = string
  default     = "ec2-instance"
}

variable "additional_tags" {
  description = "Additional tags to add to the instances"
  type        = map(string)
  default     = {}
}

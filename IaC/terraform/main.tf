provider "aws" {
  region = "us-east-1"
    access_key = var.aws_access_key
    secret_key = var.aws_secret_key 
}
variable "aws_access_key" {
  type = string
  default = ""
}
variable "aws_secret_key" {
  type = string
  default = ""
}

variable "instance_type" {
  type = string
  default = "t2.micro"
}

variable "project_name" {
  type = string
  default = "devops-project"
}

variable "team_name" {
  type = string
  default = "devops"
}

locals {
  common_tags = {
    Project = var.project_name
    Team = var.team_name
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]
  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "default" {
  vpc_id = data.aws_vpc.default.id
  availability_zone = "us-east-1a"
}
resource "random_pet" "this" {
  keepers = {
    project = var.project_name
    team = var.team_name
  }
}


# resource "aws_instance" "example" {
#   ami = data.aws_ami.ubuntu.id
#   instance_type = var.instance_type
#   tags = merge(local.common_tags, {
#     Name = "example-${random_pet.this.id}"
#   })
# }
# output "instance_id" {
#   value = aws_instance.example.id
# }
# output "instance_public_ip" {
#   value = aws_instance.example.public_ip
# }

resource "aws_key_pair" "this" {
  key_name = "example-${random_pet.this.id}"
  public_key = file("./ssh_key.pub")
}

resource "aws_security_group" "this" {
  name = "example-${random_pet.this.id}"
  description = "Example security group"
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "example" {
  count = 3
  ami = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name = aws_key_pair.this.key_name
  vpc_security_group_ids = [aws_security_group.this.id]
  tags = merge(local.common_tags, {
    Name = "example-${random_pet.this.id}-${count.index}"
  })
}

output "aws_vpc_id" {
  value = data.aws_vpc.default.id
}
output "aws_subnet_id" {
  value = data.aws_subnet.default.id
}

output "aws_instance_ids" {
  value = [for instance in aws_instance.example : instance.id]
}
output "aws_instance_public_ips" {
  value = [for instance in aws_instance.example : instance.public_ip]
}

output "aws_instance_id_and_public_ip" {
  value = [for instance in aws_instance.example : {
    id = instance.id
    public_ip = instance.public_ip
  }]
}

output "aws_instance_id_and_public_ip_map" {
  value = { for instance in aws_instance.example : instance.id => instance.public_ip }
}

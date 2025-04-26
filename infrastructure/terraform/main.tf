terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EC2 Instance
resource "aws_instance" "app_server" {
  count         = var.instance_count
  ami           = var.ami_id
  instance_type = var.instance_type

  root_block_device {
    volume_size = var.disk_size
    volume_type = "gp3"
  }

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = var.user_data_script

  tags = {
    Name = "${var.instance_name}-${count.index + 1}"
  }
}

# Security Group
resource "aws_security_group" "app_sg" {
  name        = "${var.instance_name}-sg"
  description = "Security group for application server"

  dynamic "ingress" {
    for_each = var.security_group_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
} 
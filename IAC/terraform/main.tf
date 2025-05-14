provider "aws" {
  region = var.aws_region
  access_key = ""
  secret_key = ""
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  map_public_ip_on_launch = true 
  name = var.vpc_name
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a"]
  public_subnets  = [var.public_subnet_cidr]

  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = var.tags
}

resource "aws_security_group" "instance_sg" {
  name_prefix = "instance_sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

module "ec2_instances" {
  source = "./modules/ec2_instances"

  instance_count     = var.instance_count
  ami_id            = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = module.vpc.public_subnets[0]
  key_name          = var.key_name
  security_group_ids = [aws_security_group.instance_sg.id]
  name_prefix       = var.name_prefix
  additional_tags   = var.tags
}

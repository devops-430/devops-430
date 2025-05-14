aws_region = "us-east-1"
#vpc_name    = "my-vpc"
#vpc_cidr    = "10.0.0.0/16"
#public_subnet_cidr = "10.0.1.0/24"

instance_count = 2
ami_id        = "ami-0f9de6e2d2f067fca" # Replace with your desired AMI ID
instance_type = "t2.small"
key_name      = "your-key-pair-name"
name_prefix   = "my-ec2"

tags = {
  Environment = "dev"
  Project     = "demo"
  Terraform   = "true"
}

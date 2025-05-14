provider "aws" {
    region = "us-east-1"
    access_key = ""
    secret_key = ""
}
variable "instance_type" {
    type = string
    default = "t2.nano"
}


# data "aws_ami" "ubuntu" {
#   most_recent = true
#   owners      = ["099720109477"] # Canonical

#   filter {
#     name   = "name"
#     values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
#   }

#   filter {
#     name   = "virtualization-type"
#     values = ["hvm"]
#   }
# }
resource "aws_security_group" "my_security_group" {
  name = "my_security_group"
  description = "My security group"
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

resource "aws_key_pair" "my_key_pair" {
  key_name = "my_key_pair"
  public_key = file("./mytestkey.pub")
}

resource "aws_instance" "my_instance" {
    ami = "ami-052cef01758351d39"   #ami-0f9de6e2d2f067fca

    instance_type = var.instance_type
    vpc_security_group_ids = [aws_security_group.my_security_group.id]
    key_name = aws_key_pair.my_key_pair.key_name
}

output "public_ip" {
    value = aws_instance.my_instance.public_ip
}

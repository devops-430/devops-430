# Generate SSH key pair
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create AWS key pair
resource "aws_key_pair" "generated_key" {
  key_name   = var.key_name
  public_key = tls_private_key.ssh_key.public_key_openssh

  # Save private key to file
  provisioner "local-exec" {
    command = "echo '${tls_private_key.ssh_key.private_key_pem}' > ${var.key_name}.pem"
  }
}
resource "aws_instance" "ec2_instance" {
  count = var.instance_count

  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id
  key_name      = aws_key_pair.generated_key.key_name

  vpc_security_group_ids = var.security_group_ids

  tags = merge(
    {
      Name = "${var.name_prefix}-${count.index + 1}"
    },
    var.additional_tags
    )
}

output "public_ips" {
  description = "List of public IP addresses of the created instances"
  value       = aws_instance.ec2_instance[*].public_ip
}

output "instance_ids" {
  description = "List of IDs of the created instances"
  value       = aws_instance.ec2_instance[*].id
}

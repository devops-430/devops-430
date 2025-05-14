output "instance_public_ips" {
  description = "Public IP addresses of the EC2 instances"
  value       = module.ec2_instances[*].public_ips
}

output "instance_ids" {
  description = "IDs of the EC2 instances"
  value       = module.ec2_instances.instance_ids
}

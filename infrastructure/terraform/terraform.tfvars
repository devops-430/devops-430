aws_region = "us-west-2"
instance_type = "t2.micro"
disk_size = 30
security_group_ports = [80, 443, 8080, 22]
instance_count = 1
instance_name = "test-server"
user_data_script = <<EOF
#!/bin/bash
apt-get update
apt-get install -y python3-pip
EOF 
import boto3
import secrets
import string
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class EC2Manager:
    def __init__(self):
        self.ec2 = boto3.client('ec2',
            region_name=os.getenv('AWS_REGION'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        self.instance_types = {
            'nano': 't3.nano',
            'small': 't3.small',
            'medium': 't3.medium'
        }
        
        self.ami_ids = {
            'ubuntu22.04': 'ami-0fc5d935ebf8bc3bc',  # Ubuntu 22.04 LTS AMI ID
            'ubuntu24.04': 'ami-0123456789abcdef0'   # Update with correct AMI ID when available
        }

    def create_instance(self, instance_type, os_version):
        if instance_type not in self.instance_types or os_version not in self.ami_ids:
            raise ValueError("Invalid instance type or OS version")

        # Generate a random password for the instance
        password = generate_password()
        
        # User data script to set up password authentication
        user_data_script = f"""#!/bin/bash
echo 'ubuntu:{password}' | chpasswd
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/g' /etc/ssh/sshd_config
systemctl restart sshd
"""

        # Create the instance
        response = self.ec2.run_instances(
            ImageId=self.ami_ids[os_version],
            InstanceType=self.instance_types[instance_type],
            MinCount=1,
            MaxCount=1,
            UserData=user_data_script,
            SecurityGroups=['default'],  # Make sure this security group allows SSH
            TagSpecifications=[{
                'ResourceType': 'instance',
                'Tags': [
                    {'Key': 'Name', 'Value': f'OpenLab-{instance_type}-{os_version}'},
                    {'Key': 'Project', 'Value': 'OpenLab'}
                ]
            }]
        )

        instance = response['Instances'][0]
        instance_id = instance['InstanceId']

        # Wait for the instance to be running and get its public IP
        waiter = self.ec2.get_waiter('instance_running')
        waiter.wait(InstanceIds=[instance_id])

        # Get instance details
        instance_info = self.ec2.describe_instances(InstanceIds=[instance_id])
        public_ip = instance_info['Reservations'][0]['Instances'][0]['PublicIpAddress']

        return {
            'instance_id': instance_id,
            'public_ip': public_ip,
            'username': 'ubuntu',
            'password': password,
            'status': 'running'
        }

    def start_instance(self, instance_id):
        self.ec2.start_instances(InstanceIds=[instance_id])
        waiter = self.ec2.get_waiter('instance_running')
        waiter.wait(InstanceIds=[instance_id])
        
        # Get instance details
        instance_info = self.ec2.describe_instances(InstanceIds=[instance_id])
        public_ip = instance_info['Reservations'][0]['Instances'][0]['PublicIpAddress']
        
        return {
            'instance_id': instance_id,
            'public_ip': public_ip,
            'status': 'running'
        }

    def stop_instance(self, instance_id):
        self.ec2.stop_instances(InstanceIds=[instance_id])
        waiter = self.ec2.get_waiter('instance_stopped')
        waiter.wait(InstanceIds=[instance_id])
        return {
            'instance_id': instance_id,
            'status': 'stopped'
        }

    def restart_instance(self, instance_id):
        self.ec2.reboot_instances(InstanceIds=[instance_id])
        waiter = self.ec2.get_waiter('instance_running')
        waiter.wait(InstanceIds=[instance_id])
        
        # Get instance details
        instance_info = self.ec2.describe_instances(InstanceIds=[instance_id])
        public_ip = instance_info['Reservations'][0]['Instances'][0]['PublicIpAddress']
        
        return {
            'instance_id': instance_id,
            'public_ip': public_ip,
            'status': 'running'
        }

    def delete_instance(self, instance_id):
        self.ec2.terminate_instances(InstanceIds=[instance_id])
        waiter = self.ec2.get_waiter('instance_terminated')
        waiter.wait(InstanceIds=[instance_id])
        return {
            'instance_id': instance_id,
            'status': 'terminated'
        } 
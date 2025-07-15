#!/bin/bash

# set -x

echo "Configuring AWS Credentials"

read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "Enter AWS Region: " AWS_REGION

export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_REGION=$AWS_REGION

echo "Get VPC ID"


VPC_ID=$(aws ec2 describe-vpcs \
 --filters "Name=isDefault,Values=true" \
 --query "Vpcs[*].[VpcId]" \
 --output text)

echo "VPC ID: $VPC_ID"

echo "Get Subnet ID"
SUBNET_ID=$(aws ec2 describe-subnets \
 --filters "Name=vpc-id,Values=$VPC_ID" \
 --query "Subnets[*].[SubnetId,AvailabilityZone]" \
 --output text | head -n 1 | awk '{print $1}')

echo "Get AMI ID"
AMI_ID=$(aws ec2 describe-images \
 --owners 099720109477 \
 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
           "Name=architecture,Values=x86_64" \
           "Name=root-device-type,Values=ebs" \
           "Name=virtualization-type,Values=hvm" \
 --query "Images[*].[ImageId]" \
 --output text | sort -k3 -r | head -n 1)

echo "AMI ID: $AMI_ID"
echo "Get Security Group ID"
SG_ID=$(aws ec2 describe-security-groups \
 --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=default" \
 --query "SecurityGroups[*].[GroupId,GroupName]" \
 --output text | head -n 1 | awk '{print $1}')

echo "Security Group ID: $SG_ID"

echo "allow ssh access to the security group"

aws ec2 authorize-security-group-ingress \
 --group-id $SG_ID \
 --protocol tcp \
 --port 22 \
 --cidr 0.0.0.0/0

echo "Create Key Pair"
read -p "Enter Key Pair Name: " KEY_PAIR_NAME
aws ec2 create-key-pair \
   --key-name $KEY_PAIR_NAME \
   --query 'KeyMaterial' \
   --output text > $KEY_PAIR_NAME.pem

echo "Launch EC2 Instance"
aws ec2 run-instances \
 --image-id $AMI_ID \
 --count 1 \
 --instance-type t2.micro \
 --key-name $KEY_PAIR_NAME \
 --security-group-ids $SG_ID \
 --subnet-id $SUBNET_ID \
 --user-data file://install-docker.sh \
 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Ubuntu2204VM-test}]' > ec2_instance_creation_log.json


echo "Get instance details"

aws ec2 describe-instances \
 --filters "Name=tag:Name,Values=Ubuntu2204VM-test" \
 --query "Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]" \
 --output table


echo "EC2 Instance created successfully"


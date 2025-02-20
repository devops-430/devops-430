#!/bin/bash
aws cloudformation create-change-set \
  --stack-name php-3tier-vpc-stack \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/vpc-template.yaml \
  --parameters ParameterKey=VpcCIDR,ParameterValue=10.192.0.0/16 \
               ParameterKey=PublicSubnet1CIDR,ParameterValue=10.192.10.0/24 \
               ParameterKey=PublicSubnet2CIDR,ParameterValue=10.192.11.0/24 \
               ParameterKey=PrivateSubnet1CIDR,ParameterValue=10.192.20.0/24 \
               ParameterKey=PrivateSubnet2CIDR,ParameterValue=10.192.21.0/24 \
  --capabilities CAPABILITY_IAM \
  --change-set-name php-3tier-vpc-changeset

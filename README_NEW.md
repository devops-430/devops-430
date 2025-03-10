Here's a structured README with a table format for your **devops-430** CloudFormation deployment process:  

---

# **DevOps-430: AWS CloudFormation Deployment Guide**  

## **Table of Contents**  

| Section | Description |
|---------|------------|
| [Before You Begin](#before-you-begin) | Pre-requisites before deploying |
| [Steps to Deploy Infrastructure](#steps-to-deploy-infrastructure) | CloudFormation deployment steps |
| [Monitoring & Updating Stack](#monitoring--updating-stack) | Tracking and updating stack progress |
| [Fixing Deployment Issues](#fixing-deployment-issues) | Troubleshooting common CloudFormation errors |
| [SSH Key Pair Management](#ssh-key-pair-management) | Creating and managing EC2 key pairs |
| [Deleting Resources](#deleting-resources) | Removing CloudFormation stacks and related resources |
| [Common Issues & Resolutions](#common-issues--resolutions) | Handling deployment failures |

---

## **Before You Begin**  

Ensure the following:  
- **AWS CLI** is installed and configured with a valid profile.  
- **IAM permissions** are set up for managing CloudFormation stacks.  
- **S3 bucket** exists for storing CloudFormation templates.  

---

## **Steps to Deploy Infrastructure**  

### **1. Create an S3 Bucket**  
```bash
aws s3 mb s3://my-cloudformation-templates-devops430 --region us-east-1 --profile lab
```

### **2. Upload Templates to S3**  
```bash
aws s3 cp cloudformation-template/ s3://my-cloudformation-templates-devops430/ --recursive --profile lab
aws s3 cp scripts/user-data.sh s3://my-cloudformation-templates-devops430/ --profile lab
```

### **3. Create CloudFormation Stack**  
```bash
aws cloudformation create-stack --stack-name php-3-tier --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml --region us-east-1 --profile lab
```

### **4. Monitor Stack Creation**  
```bash
aws cloudformation describe-stacks --stack-name php-3-tier --region us-east-1 --profile lab
```

### **5. Update CloudFormation Stack**  
```bash
aws cloudformation update-stack \
    --stack-name php-3-tier \
    --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
    --region us-east-1 \
    --profile lab
```

---

## **Monitoring & Updating Stack**  

| Command | Purpose |
|---------|---------|
| `describe-stacks` | View current stack status |
| `describe-stack-events` | Check events related to stack creation or failures |
| `update-stack` | Modify an existing stack |
| `delete-stack` | Remove a CloudFormation stack |

---

## **Fixing Deployment Issues**  

### **Issue: Missing VPC Output**  
**Error:**  
```json
"ResourceStatusReason": "Output 'VPCId' not found in stack"
```
**Solution:** Create a change set to fix VPC references.  
```bash
aws cloudformation create-change-set \
  --stack-name php-3-tier \
  --change-set-name FixVpcIdIssue \
  --template-body file://cloudformation-template/php-3-tier.yaml \
  --capabilities CAPABILITY_NAMED_IAM --profile lab
```

### **Issue: Requires IAM Capabilities**  
**Error:**  
```json
"ResourceStatusReason": "Requires capabilities : [CAPABILITY_IAM]"
```
**Solution:** Include `--capabilities CAPABILITY_IAM` when creating or updating the stack.  
```bash
aws cloudformation update-stack \
  --stack-name php-3-tier \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
  --capabilities CAPABILITY_IAM --profile lab
```

---

## **SSH Key Pair Management**  

### **Generate a Key Pair**  
```bash
aws ec2 create-key-pair --key-name my-key-pair --query "KeyMaterial" --profile lab --output text > my-key-pair.pem
chmod 400 my-key-pair.pem
```

### **List Existing Key Pairs**  
```bash
aws ec2 describe-key-pairs --query "KeyPairs[*].KeyName" --profile lab
```

### **Import an Existing Public Key**  
```bash
ssh-keygen -y -f ./my-key-pair.pem > my-key-pair.pub
aws ec2 import-key-pair --key-name my-key-pair --public-key-material fileb://my-key-pair.pub --profile lab
```

---

## **Deleting Resources**  

### **Delete CloudFormation Stack**  
```bash
aws cloudformation delete-stack --stack-name php-3-tier --region us-east-1 --profile lab
```

### **Delete Change Set**  
```bash
aws cloudformation delete-change-set --change-set-name add-database-stack --stack-name php-3-tier --profile lab
```

---

## **Common Issues & Resolutions**  

| Issue | Solution |
|-------|----------|
| **CREATE_FAILED due to missing IAM capability** | Add `--capabilities CAPABILITY_IAM` when creating or updating the stack. |
| **VPC output missing** | Ensure VPC ID is correctly referenced and create a change set if needed. |
| **Stack deletion failure due to subnet group** | Manually delete associated resources before retrying. |

---

## **Conclusion**  

This guide provides step-by-step instructions to deploy infrastructure using AWS CloudFormation for **DevOps-430**. Follow the troubleshooting steps if any issues occur.
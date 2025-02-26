# devops-430

## Steps to deploy infrastructure through cloudformation template

1. Create Bucket
```bash
aws s3 mb s3://my-cloudformation-templates-devops430 --region us-east-1 --profile lab
```

2. Copy file to bucket
```bash
 aws s3 cp cloudformation-template/ s3://my-cloudformation-templates-devops430/ --recursive --profile lab
 ```
 - copy `user-data.sh` script
 ```bash
 aws s3 cp scripts/user-data.sh s3://my-cloudformation-templates-devops430/ --profile lab
 ```

3. Create the CloudFormation stack with the name `php-3-tier`:
```bash
aws cloudformation create-stack --stack-name php-3-tier --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml --region us-east-1 --profile lab
```

4. Monitor the stack creation:
```bash
aws cloudformation describe-stacks --stack-name php-3-tier --region us-east-1 --profile lab

```
5. Check events
```bash
aws cloudformation describe-stack-events --stack-name php-3-tier --region us-east-1 --profile lab
```

6. Update stack
```bash
aws cloudformation update-stack \
    --stack-name php-3-tier \
    --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
    --region us-east-1 \
    --profile lab

```

7. Delete existing stack
```bash
aws cloudformation delete-stack --stack-name php-3-tier --region us-east-1 --profile lab

```
8. Create VPC with parameters
```bash
aws cloudformation create-stack \
  --stack-name php-3-tier \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
  --region us-east-1 \
  --profile lab \
  --parameters \
    ParameterKey=VpcCIDR,ParameterValue=10.192.0.0/16 \
    ParameterKey=PublicSubnet1CIDR,ParameterValue=10.192.10.0/24 \
    ParameterKey=PublicSubnet2CIDR,ParameterValue=10.192.11.0/24 \
    ParameterKey=PrivateSubnet1CIDR,ParameterValue=10.192.20.0/24 \
    ParameterKey=PrivateSubnet2CIDR,ParameterValue=10.192.21.0/24

```
9. Fix below error with changeset
```bash
{
            "StackId": "arn:aws:cloudformation:us-east-1:471112545090:stack/php-3-tier/432886c0-f1ec-11ef-b0a4-0affdf34ce8f",
            "EventId": "BackendStack-CREATE_FAILED-2025-02-23T13:44:48.882Z",
            "StackName": "php-3-tier",
            "LogicalResourceId": "BackendStack",
            "PhysicalResourceId": "",
            "ResourceType": "AWS::CloudFormation::Stack",
            "Timestamp": "2025-02-23T13:44:48.882000+00:00",
            "ResourceStatus": "CREATE_FAILED",
            "ResourceStatusReason": "Output 'VPCId' not found in stack 'arn:aws:cloudformation:us-east-1:471112545090:stack/php-3-tier-NetworkStack-KGBNT9LIB90Y/44d7e470-f1ec-11ef-b229-0ee16fdadd4d'"
        },
```
- Create change set
```bash
aws cloudformation create-change-set \
  --stack-name php-3-tier \
  --template-body file://cloudformation-template/php-3-tier.yaml \
  --change-set-name FixVpcIdIssue \
  --capabilities CAPABILITY_NAMED_IAM
  --profile lab
```

> Note: Changeset can not be applied in rollback complete state.

10. Create cloudformation stack with parameters
```bash
 aws cloudformation create-stack \
  --stack-name php-3-tier \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
  --region us-east-1 \
  --profile lab \
  --parameters \
    ParameterKey=KeyPairName,ParameterValue=my-key-pair \
    ParameterKey=S3BucketName,ParameterValue=my-cloudformation-templates-devops430 \
    ParameterKey=UserDataFileName,ParameterValue=user-data.sh
```
11. Next now enable Database and apply as changeset

```bash
aws cloudformation create-change-set \
  --stack-name php-3-tier \
  --change-set-name add-database-stack \
  --template-url https://s3.amazonaws.com/my-cloudformation-templates-devops430/php-3-tier.yaml \
  --parameters ParameterKey=S3BucketName,ParameterValue=my-cloudformation-templates-devops430 \
               ParameterKey=UserDataFileName,ParameterValue=user-data.sh \
               ParameterKey=KeyPairName,ParameterValue=my-key-pair \
  --profile lab

```
12. Check the Change Set
```bash
aws cloudformation describe-change-set \
  --stack-name php-3-tier \
  --change-set-name add-database-stack \
  --profile lab
```
13. Execute the Change Set
```bash
aws cloudformation execute-change-set \
  --stack-name php-3-tier \
  --change-set-name add-database-stack \
  --profile lab

```
14. Monitor the Stack Update
```bash
aws cloudformation describe-stacks \
  --stack-name php-3-tier \
  --profile lab
```
15. Check event for more detail
```bash
aws cloudformation describe-stack-events --stack-name php-3-tier --region us-east-1 --profile lab
```

16. Check the existing change set
```bash
aws cloudformation describe-change-set --change-set-name add-database-stack --stack-name php-3-tier --profile lab

```

17. Delete the existing change set
```bash
aws cloudformation delete-change-set --change-set-name add-database-stack --stack-name php-3-tier --profile lab

```
18. Create the change set again
```bash
aws cloudformation create-change-set \
  --stack-name php-3-tier \
  --change-set-name add-database-stack \
  --template-url https://s3.amazonaws.com/my-cloudformation-templates-devops430/php-3-tier.yaml \
  --parameters ParameterKey=S3BucketName,ParameterValue=my-cloudformation-templates-devops430 \
               ParameterKey=UserDataFileName,ParameterValue=user-data.sh \
               ParameterKey=KeyPairName,ParameterValue=my-key-pair \
  --profile lab
```

19. Create ssh keypair
```bash
aws ec2 create-key-pair --key-name my-key-pair --query "KeyMaterial" --profile lab --output text > my-key-pair.pem
chmod 400 my-key-pair.pem
```

20. List aws keypair
```bash
aws ec2 describe-key-pairs --query "KeyPairs[*].KeyName" --profile lab
```

21. If you have already a private key
  - Generate public key
```bash
 ssh-keygen -y -f ./my-key-pair.pem > my-key-pair.pub
 ```
  - Import the Public Key into AWS
  ```bash
  aws ec2 import-key-pair \
    --key-name my-key-pair \
    --public-key-material fileb://my-key-pair.pub \
    --profile lab
  ```
  - To check if the key was successfully imported:
  ```bash
  aws ec2 describe-key-pairs --key-name my-key-pair --profile lab
  ```


### Issues
1. Some resources might fail due to inadequate permissions.

```bash
 {
            "StackId": "arn:aws:cloudformation:us-east-1:471112726268:stack/php-3-tier/0f8a8280-f2b6-11ef-ab94-0e947989e88d",
            "EventId": "DatabaseStack-CREATE_FAILED-2025-02-24T13:52:13.301Z",
            "StackName": "php-3-tier",
            "LogicalResourceId": "DatabaseStack",
            "PhysicalResourceId": "",
            "ResourceType": "AWS::CloudFormation::Stack",
            "Timestamp": "2025-02-24T13:52:13.301000+00:00",
            "ResourceStatus": "CREATE_FAILED",
            "ResourceStatusReason": "Requires capabilities : [CAPABILITY_IAM]",
            "ResourceProperties": "{\"TemplateURL\":\"https://s3.amazonaws.com/my-cloudformation-templates-devops430/rds.yaml\"}"
        },
```

- Resolve:

```bash
 aws cloudformation create-stack \
  --stack-name php-3-tier \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
  --region us-east-1 \
  --profile lab \
  --parameters \
    ParameterKey=KeyPairName,ParameterValue=my-key-pair \
    ParameterKey=S3BucketName,ParameterValue=my-cloudformation-templates-devops430 \
    ParameterKey=UserDataFileName,ParameterValue=user-data.sh \
  --capabilities CAPABILITY_IAM
```
or update
```bash
aws cloudformation update-stack \
  --stack-name php-3-tier \
  --template-url https://my-cloudformation-templates-devops430.s3.amazonaws.com/php-3-tier.yaml \
  --region us-east-1 \
  --profile lab \
  --parameters \
    ParameterKey=KeyPairName,ParameterValue=my-key-pair \
    ParameterKey=S3BucketName,ParameterValue=my-cloudformation-templates-devops430 \
    ParameterKey=UserDataFileName,ParameterValue=user-data.sh \
  --capabilities CAPABILITY_IAM
```

- Resource delete issue
```bash
{
            "StackId": "arn:aws:cloudformation:us-east-1:211125585429:stack/php-3-tier/17d32450-f33e-11ef-acae-0e7e312e04ab",
            "EventId": "DatabaseStack-DELETE_FAILED-2025-02-25T06:27:56.090Z",
            "StackName": "php-3-tier",
            "LogicalResourceId": "DatabaseStack",
            "PhysicalResourceId": "arn:aws:cloudformation:us-east-1:211125585429:stack/php-3-tier-DatabaseStack-39OGMOYHYXAD/2e781bc0-f33e-11ef-9415-0affc9377d4d",
            "ResourceType": "AWS::CloudFormation::Stack",
            "Timestamp": "2025-02-25T06:27:56.090000+00:00",
            "ResourceStatus": "DELETE_FAILED",
            "ResourceStatusReason": "Embedded stack arn:aws:cloudformation:us-east-1:211125585429:stack/php-3-tier-DatabaseStack-39OGMOYHYXAD/2e781bc0-f33e-11ef-9415-0affc9377d4d was not successfully deleted: The following resource(s) failed to delete: [SampleCloudFormationDBSubnetGroup]. ",
            "ResourceProperties": "{\"TemplateURL\":\"https://s3.amazonaws.com/my-cloudformation-templates-devops430/rds.yaml\",\"Parameters\":{\"PrivateSubnet1\":\"subnet-01e82ced1ed78320b\",\"PrivateSubnet2\":\"subnet-034d3d119bd85f618\",\"VpcId\":\"vpc-0a7e3ef930dc46f39\",\"SecurityGroupId\":\"sg-07f0d3263217fc1eb\"}}"
        },
```
1. Check active instance
```bash
aws rds describe-db-instances --query "DBInstances[*].DBInstanceIdentifier" --profile lab
```

2. Delete instance
```bash
aws rds delete-db-instance --db-instance-identifier sample-cloudformation-postgresql --skip-final-snapshot --profile lab
```

3. Wait for the deletion to complete
```bash
aws rds describe-db-instances --query "DBInstances[*].DBInstanceStatus" --profile lab
```

4. Find DB subnet group
```bash
aws rds describe-db-subnet-groups --query "DBSubnetGroups[*].DBSubnetGroupName" --profile lab
```


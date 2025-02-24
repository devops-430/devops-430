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
    ParameterKey=UserDataFileName,ParameterValue=useradd.sh
```



# devops-430

## Steps to deploy infrastructure through cloudformation template

1. Create Bucket
```bash
aws s3 mb s3://my-cloudformation-templates-devops430 --region us-east-1
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


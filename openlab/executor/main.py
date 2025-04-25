import os
from typing import Dict, List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import boto3
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()

app = FastAPI(title="OpenLab Executor Service")

# AWS Configuration
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION", "us-east-1")
backend_url = os.getenv("BACKEND_API_URL", "http://localhost:3000")

# Initialize AWS clients
ec2_client = boto3.client(
    'ec2',
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=aws_region
)

class MachineRequest(BaseModel):
    name: str
    instance_type: str
    ami_id: str
    user_id: str

class MachineResponse(BaseModel):
    instance_id: str
    status: str
    public_ip: str = None
    private_ip: str = None

@app.post("/create", response_model=MachineResponse)
async def create_machine(request: MachineRequest):
    try:
        # Create EC2 instance
        response = ec2_client.run_instances(
            ImageId=request.ami_id,
            InstanceType=request.instance_type,
            MinCount=1,
            MaxCount=1,
            TagSpecifications=[
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {
                            'Key': 'Name',
                            'Value': request.name
                        },
                        {
                            'Key': 'UserID',
                            'Value': request.user_id
                        }
                    ]
                }
            ]
        )
        
        instance = response['Instances'][0]
        
        # Update backend with machine details
        machine_data = {
            "instance_id": instance['InstanceId'],
            "name": request.name,
            "user_id": request.user_id,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        requests.post(f"{backend_url}/api/machines", json=machine_data)
        
        return MachineResponse(
            instance_id=instance['InstanceId'],
            status="pending"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start/{instance_id}")
async def start_machine(instance_id: str):
    try:
        ec2_client.start_instances(InstanceIds=[instance_id])
        return {"status": "starting"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stop/{instance_id}")
async def stop_machine(instance_id: str):
    try:
        ec2_client.stop_instances(InstanceIds=[instance_id])
        return {"status": "stopping"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{instance_id}")
async def get_machine_status(instance_id: str):
    try:
        response = ec2_client.describe_instances(InstanceIds=[instance_id])
        instance = response['Reservations'][0]['Instances'][0]
        
        return {
            "instance_id": instance_id,
            "status": instance['State']['Name'],
            "public_ip": instance.get('PublicIpAddress'),
            "private_ip": instance.get('PrivateIpAddress')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 

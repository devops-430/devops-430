# OpenLab - Lab Machine Management System

A distributed system for managing lab machines with the following components:

## Architecture

- **Frontend**: React/Next.js application providing the user interface
- **Backend API**: Node.js service handling database operations and authentication
- **Fetcher Service**: Go service for fetching machine details
- **Executor Service**: Python service using boto3 for AWS operations
- **Database**: MongoDB for data persistence

## Components

### Frontend
- User authentication
- Dashboard for machine management
- Machine creation interface
- Machine status monitoring

### Backend API
- User authentication and authorization
- Database operations
- API endpoints for machine management
- Integration with Fetcher and Executor services

### Fetcher Service (Go)
- Fetches machine details from remote systems
- Provides machine status updates
- Communicates with Backend API

### Executor Service (Python)
- Handles AWS API operations using boto3
- Manages machine lifecycle (create, start, stop)
- Communicates with Backend API
- Implements AWS EC2 instance management

## Setup Instructions

1. Install dependencies for each service
2. Configure environment variables
3. Start MongoDB
4. Start all services
5. Access the frontend application

## Environment Variables

Each service requires specific environment variables:

### Backend API
- MONGODB_URI
- JWT_SECRET
- PORT

### Executor Service
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- BACKEND_API_URL

### Fetcher Service
- BACKEND_API_URL
- REMOTE_SYSTEMS_CONFIG 
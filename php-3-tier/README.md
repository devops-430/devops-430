# PHP 3-Tier Application on Kubernetes

This repository contains a 3-tier PHP application deployment using Kubernetes. The application consists of a frontend web server (Apache), a PHP backend, and a MySQL database.

## Architecture Overview

```
[Frontend (Apache)] → [Backend (PHP)] → [Database (MySQL)]
```

- **Frontend**: Apache web server serving static content
- **Backend**: PHP application handling business logic
- **Database**: MySQL storing application data

## Directory Structure

```
php-3-tier/
├── frontend/          # Frontend static files
├── api/              # PHP backend code
├── db/               # Database initialization scripts
├── docker-compose.yaml # Local development setup
└── k8s-manifests/    # Kubernetes manifests
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── mysql-deployment.yaml
    ├── mysql-service.yaml
    ├── configmaps.yaml
    └── secrets.yaml
```

## Kubernetes Resource Organization

### Labels and Annotations

We use a comprehensive labeling strategy to organize and manage our Kubernetes resources effectively.

#### Labels Used
- `app`: Identifies the specific component (frontend/backend/mysql)
- `tier`: Identifies the application tier (frontend/backend/database)
- `part-of`: Groups all components as part of the application
- `environment`: Identifies the deployment environment

Example:
```yaml
labels:
  app: frontend
  tier: frontend
  part-of: php-3-tier
  environment: production
```

#### Benefits of Labels
1. **Resource Organization**: Easy grouping and filtering of related resources
2. **Operations**: Simplified maintenance and troubleshooting
3. **Cost Allocation**: Track resources by component or team
4. **Service Selection**: Precise targeting for services and network policies

### Annotations Used
We use annotations to provide additional metadata and enable certain functionalities:

```yaml
annotations:
  description: "Component description"
  maintainer: "devops-team"
  version: "1.0.0"
  prometheus.io/scrape: "true"
  prometheus.io/port: "80"
```

#### Benefits of Annotations
1. **Documentation**: Built-in documentation about resource purpose and ownership
2. **Monitoring Integration**: Automatic metric collection configuration
3. **Deployment Tracking**: Version and change management
4. **Automation**: Enable automated tools and workflows

## Security Best Practices

### Network Policies

Network policies can be implemented to enforce the principle of least privilege and secure communication between components.

#### Recommended Policy Rules

1. **Frontend Policy**
   - Allow inbound HTTP traffic (port 80) from all sources
   - Allow outbound traffic only to backend
   - Block direct access to database

```yaml
spec:
  podSelector:
    matchLabels:
      tier: frontend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 0.0.0.0/0
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: backend
```

2. **Backend Policy**
   - Accept traffic only from frontend
   - Allow outbound traffic only to database
   - Block all other communication

3. **Database Policy**
   - Accept traffic only from backend
   - Block all other inbound traffic

#### Benefits of Network Policies
1. **Security**: Enforce zero-trust networking
2. **Isolation**: Prevent unauthorized access between tiers
3. **Compliance**: Meet regulatory requirements
4. **Visibility**: Clear documentation of allowed communication paths

### Additional Security Considerations

1. **Secrets Management**
   - Use Kubernetes secrets for sensitive data
   - Avoid hardcoding credentials
   - Implement proper secret rotation

2. **Resource Isolation**
   - Use namespaces for environment separation
   - Implement resource quotas
   - Set up RBAC policies

## Best Practices for Implementation

1. **High Availability**
   - Set appropriate replica counts for each tier
   - Use pod disruption budgets
   - Implement health checks

2. **Resource Management**
   - Set resource requests and limits
   - Implement horizontal pod autoscaling
   - Monitor resource usage

3. **Configuration Management**
   - Use ConfigMaps for configuration
   - Implement proper environment variable management
   - Version control all configurations

4. **Monitoring and Logging**
   - Enable Prometheus metrics
   - Implement centralized logging
   - Set up alerting

## Getting Started

1. Apply the Kubernetes manifests:
```bash
kubectl apply -f k8s-manifests/
```

2. Verify the deployment:
```bash
kubectl get pods
kubectl get services
```

3. Access the application:
```bash
kubectl port-forward svc/frontend 3000:80
```

## Kubernetes API Authentication Methods

Kubernetes provides multiple ways to authenticate with the API server:

### 1. Using kubectl (Client-side Authentication)

The most common method is using the `kubectl` command-line tool:

```bash
# Using kubeconfig file (default)
kubectl get pods

# Explicitly specifying kubeconfig
kubectl --kubeconfig=/path/to/kubeconfig get pods

# Using context
kubectl --context=my-context get pods
```

### 2. Service Account Tokens

For automated processes and applications:

```bash
# Get the service account token
TOKEN=$(kubectl get secret $(kubectl get serviceaccount my-service-account -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 --decode)

# Use the token with curl
curl -k -H "Authorization: Bearer $TOKEN" https://kubernetes.default.svc/api/v1/namespaces/default/pods
```

### 3. Client Certificates

Using X.509 client certificates:

```bash
curl --cert /path/to/client.crt --key /path/to/client.key --cacert /path/to/ca.crt https://kubernetes.default.svc/api/v1/namespaces/default/pods
```

### 4. OpenID Connect (OIDC)

For integration with identity providers:

```bash
# Configure kubectl to use OIDC
kubectl config set-credentials oidc-user --auth-provider=oidc --auth-provider-arg=idp-issuer-url=https://identity-provider.com --auth-provider-arg=client-id=my-client-id --auth-provider-arg=client-secret=my-client-secret --auth-provider-arg=refresh-token=my-refresh-token
```

### 5. Webhook Authentication

For custom authentication logic:

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://kubernetes.default.svc
    certificate-authority-data: <base64-encoded-ca-data>
  name: my-cluster
contexts:
- context:
    cluster: my-cluster
    user: my-user
  name: my-context
current-context: my-context
preferences: {}
users:
- name: my-user
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: my-auth-plugin
      args:
      - --arg1=value1
      - --arg2=value2
```

## Creating Resources with Direct API Calls

### Example: Creating an Nginx Pod using curl

```bash
# Get the API server URL and authentication token
APISERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
TOKEN=$(kubectl get secret $(kubectl get serviceaccount default -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 --decode)

# Create a pod definition
cat <<EOF > nginx-pod.json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "nginx-pod",
    "labels": {
      "app": "nginx"
    }
  },
  "spec": {
    "containers": [
      {
        "name": "nginx",
        "image": "nginx:latest",
        "ports": [
          {
            "containerPort": 80
          }
        ],
        "resources": {
          "requests": {
            "memory": "128Mi",
            "cpu": "100m"
          },
          "limits": {
            "memory": "256Mi",
            "cpu": "200m"
          }
        }
      }
    ]
  }
}
EOF

# Create the pod using curl
curl -k -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @nginx-pod.json \
  $APISERVER/api/v1/namespaces/default/pods
```

## Future Enhancements

1. Implement Network Policies for enhanced security
2. Set up SSL/TLS termination
3. Implement service mesh for advanced traffic management
4. Add monitoring and logging stack
5. Implement CI/CD pipeline

## Troubleshooting

Common issues and their solutions:
1. Pod startup issues: Check logs using `kubectl logs`
2. Connection issues: Verify network policies and service discovery
3. Database connection: Verify secrets and configmaps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Maintainers

- DevOps Team 
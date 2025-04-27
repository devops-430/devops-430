## Kubernetes Guides:

1. If / path is working but `/api` is not working then fix as below:

- `/` (frontend) is working ✅
- `/api` (backend) is **NOT** working ❌ — it says `Not Found` from Apache.

---
**Problem:**
Your Ingress is correctly forwarding `/api` to the `backend` **service**, but inside your **backend pod**, Apache **doesn't know about** `/api`.  
It’s still trying to find a local `/api` folder or route — **and it fails**.

**Simply put:**
Ingress adds `/api` to the request, but your backend app is not ready to handle `/api` paths!

---
### 🔥 Quick Solutions:

**Option 1: Strip `/api` at Ingress (recommended)**  
You can tell Ingress to **rewrite** the path so that the backend gets clean `/` instead of `/api`.  
Here’s how:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

✅ **What this does:**  
- If you access `/api/todos`, it **rewrites** to `/todos` for the backend.
- The backend does **NOT** need to know `/api` exists.

---
**Option 2: Fix the backend app**  
Inside your backend, you can configure Apache or your app (PHP?) to expect `/api` as a root route.

But honestly, **rewriting at Ingress is easier and cleaner**.

---
### 📋 Checklist after you update:
1. Apply the updated ingress:
   ```bash
   kubectl apply -f ingress.yaml
   ```
2. Make sure you have the Ingress controller installed (like nginx-ingress).
3. Then visit `http://44.198.162.210/api/your-backend-endpoint` and it should work!

---
### For option 2
Understood — you want to configure your Apache backend to handle requests forwarded by the Ingress controller, which includes the `/api` prefix. To achieve this, you can use Apache's `mod_rewrite` module to strip the `/api` prefix from incoming requests. Here's how you can set this up:

---

### ✅ Step-by-Step: Strip `/api` Prefix in Apache

#### 1. **Enable `mod_rewrite`**

Ensure that the `mod_rewrite` module is enabled in your Apache configuration. You can enable it using the following command:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### 2. **Configure `.htaccess`**

Create or edit the `.htaccess` file in your Apache document root (e.g., `/var/www/html`) with the following content:

```apache
RewriteEngine On

# Remove /api prefix
RewriteRule ^api/(.*)$ /$1 [L]
```

This rule matches any URL starting with `/api/` and rewrites it by removing the `/api` prefix, allowing your application to handle the request as if it were made to the root path.

#### 3. **Allow `.htaccess` Overrides**

Ensure that your Apache configuration permits `.htaccess` overrides. In your Apache configuration file (e.g., `/etc/apache2/sites-available/000-default.conf`), update the `<Directory>` directive:

```apache
<Directory /var/www/html>
    AllowOverride All
</Directory>
```

After making this change, restart Apache to apply the new configuration:

```bash
sudo systemctl restart apache2
```

---

### 🔍 Verification

After completing the above steps, test your setup:

- Accessing `http://your-domain/api/endpoint` should internally rewrite to `http://your-domain/endpoint`, allowing your backend application to process the request correctly.

Got it —  
I'll **fix your YAML** to properly **strip `/api` inside Ingress** without changing too much.

Here’s your **corrected version**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  rules:
  - http:
      paths:
      - path: /api/(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: backend
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

---

✅ **Changes I made:**
- `rewrite-target: /$1` (not `$2` anymore)
- path `/api/(.*)` (regex match everything after `/api/`)
- pathType: `ImplementationSpecific` for proper regex support

Annotations in Kubernetes provide a powerful and flexible way to attach arbitrary metadata to resources, which can be used by various controllers, tools, and external systems. While annotations are not directly involved in resource selection or grouping (like labels), they are useful for storing additional information that can affect the behavior of your infrastructure and applications.

### Practical Uses of Annotations

Here are several common and practical use cases for annotations in Kubernetes, along with explanations of why you might need them:

---

### 1. **Ingress Controller Configurations**
   - **Use Case**: Annotations in Ingress resources are used to configure specific behaviors of Ingress controllers (e.g., NGINX, Traefik).
   - **Example**: Configuring SSL redirection, rate-limiting, or path rewriting.
     ```yaml
     annotations:
       nginx.ingress.kubernetes.io/ssl-redirect: "true"
       nginx.ingress.kubernetes.io/rewrite-target: /
     ```
   - **Why Needed**: This allows fine-grained control over how the Ingress controller behaves. Instead of modifying the controller’s configuration, you can use annotations on a per-Ingress resource to define specific behaviors.

---

### 2. **Logging and Monitoring**
   - **Use Case**: Storing metadata for monitoring and logging tools like Prometheus, Datadog, or custom logging agents.
   - **Example**: Adding the version of an application to help monitor and track specific versions in logs.
     ```yaml
     annotations:
       version: "v1.2.3"
       monitoring.kubernetes.io/scrape: "true"
     ```
   - **Why Needed**: This allows tools or scripts to gather additional context about a pod or service, making monitoring and troubleshooting easier. For example, knowing the version of a deployed application can help debug specific issues related to that version.

---

### 3. **Helm Chart Metadata**
   - **Use Case**: Annotations can be used to store metadata generated by Helm charts.
   - **Example**: A Helm deployment might automatically add annotations to track the release name or version.
     ```yaml
     annotations:
       helm.sh/chart: "my-app-1.0.0"
       app.kubernetes.io/managed-by: "Helm"
     ```
   - **Why Needed**: Helps maintain the relationship between resources and their Helm charts. This is helpful when performing upgrades, rollbacks, or debugging Helm-managed resources.

---

### 4. **Custom Resource Definitions (CRDs)**
   - **Use Case**: Annotations can be used in CRDs to provide additional configuration or metadata for custom controllers.
   - **Example**: Storing additional settings for custom controllers.
     ```yaml
     annotations:
       customresourcecontroller.io/timeout: "30s"
       customresourcecontroller.io/priority: "high"
     ```
   - **Why Needed**: Annotations allow you to attach metadata to custom resources that may be used by custom controllers to modify behavior or store runtime information.

---

### 5. **External Tool Integrations**
   - **Use Case**: External tools or platforms can use annotations to store data for integration purposes.
   - **Example**: Integration with CI/CD tools like Jenkins or ArgoCD.
     ```yaml
     annotations:
       ci.ci-cd-tool.io/build-status: "success"
       argocd.argoproj.io/sync-wave: "1"
     ```
   - **Why Needed**: Annotations allow external systems to store context-specific data directly in Kubernetes resources, helping with better integration between your cluster and third-party tools.

---

### 6. **Resource Management and Scheduling**
   - **Use Case**: Storing configuration or scheduling hints that are not natively supported by Kubernetes.
   - **Example**: Storing preferred scheduling constraints or affinity preferences for a pod.
     ```yaml
     annotations:
       scheduler.alpha.kubernetes.io/affinity: '{"podAffinity": {"requiredDuringSchedulingIgnoredDuringExecution": ...}}'
     ```
   - **Why Needed**: Some advanced resource management behaviors or scheduler configurations can be expressed through annotations to fine-tune scheduling, affinity, or other operational aspects.

---

### 7. **Security and Compliance**
   - **Use Case**: Tracking compliance information or tagging resources with security-related data.
   - **Example**: Marking resources as compliant or storing security audit information.
     ```yaml
     annotations:
       security.kubernetes.io/compliant: "true"
       compliance.audit.k8s.io/last-checked: "2025-04-27"
     ```
   - **Why Needed**: Annotations can be used by security tools or auditors to track compliance status, last audit times, or indicate whether the resource has passed certain security policies or checks.

---

### 8. **Automatic Resource Management**
   - **Use Case**: Automatically managing resource cleanup or rotation via external tools.
   - **Example**: An annotation that tells an operator or cron job when to clean up or rotate secrets.
     ```yaml
     annotations:
       cleanup.tool.io/rotate-on: "2025-05-01T00:00:00Z"
     ```
   - **Why Needed**: External tools or scripts can query these annotations and trigger actions like cleanup, rotation, or refreshing resources based on the provided metadata.

---

### 9. **Versioning and Rollout Tracking**
   - **Use Case**: Storing versioning information for application rollouts or specific configurations.
   - **Example**: Tracking which release or deployment version is currently active in a Kubernetes resource.
     ```yaml
     annotations:
       app.version: "v1.5.0"
       release.date: "2025-04-01"
     ```
   - **Why Needed**: This helps with tracking deployments, rollouts, and simplifying version management. It’s useful when debugging or performing rollbacks to track exactly what version is running in the cluster.

---

### 10. **Custom Actions or Event Triggers**
   - **Use Case**: Triggering custom actions or scripts based on annotations.
   - **Example**: Adding an annotation that triggers a backup job for a database or a periodic task.
     ```yaml
     annotations:
       backup.mydatabase.io/trigger: "true"
     ```
   - **Why Needed**: This allows custom automation based on the state or configuration of Kubernetes resources. External systems can watch these annotations to trigger processes like backups, scaling actions, or data migration.

---

### **Why Do We Need Annotations?**
1. **Flexible and Extensible**: Annotations allow you to extend Kubernetes with arbitrary metadata without modifying Kubernetes’ native functionality.
2. **Integration with External Tools**: They enable seamless integration with external systems, controllers, or monitoring tools.
3. **Configuring Controller Behavior**: Some controllers or applications depend on annotations to configure behavior that can’t be easily handled by native Kubernetes resources (e.g., path rewrites in Ingress controllers).
4. **Tracking and Auditing**: Annotations are useful for adding traceable, audit-friendly metadata to resources that can be helpful for troubleshooting or compliance.
5. **Automation and Orchestration**: They help in automation, as tools can react to changes in annotations to trigger or modify workflows.

### Summary:
Annotations are versatile and can be used for a wide range of purposes, including controlling behaviors, integrating with external tools, tracking metadata, and automating tasks. Their flexibility is one of the reasons they are so useful in Kubernetes clusters.

---

Now:
- You call `http://your-ip/api/hello` → backend gets `/hello`
- You call `http://your-ip/api/v1/users` → backend sees `/v1/users`
- **No `/api`** reaches Apache/backend anymore.


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

---

Now:
- You call `http://your-ip/api/hello` → backend gets `/hello`
- You call `http://your-ip/api/v1/users` → backend sees `/v1/users`
- **No `/api`** reaches Apache/backend anymore.


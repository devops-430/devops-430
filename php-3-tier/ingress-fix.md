
When you define this Ingress rule:

```yaml
- path: /api
  pathType: Prefix
  backend:
    service:
      name: backend
      port:
        number: 80
```

It means:  
**Traefik** (your Ingress Controller) **takes requests like `/api/anything` and forwards them to the backend service**.

**BUT Traefik *does NOT* strip the `/api` prefix automatically** unless you configure it to!  
So the backend app receives the URL `/api`, not `/`.

🔵 **Problem:**  
Your backend PHP app expects requests at `/`, not `/api`.

🔵 **Result:**  
Backend gets `/api`, doesn't know what to do → 404 or error.

---

# 🛠️ Two options to fix it

### Option 1: Change Ingress to Use Traefik `rewrite-target`
You can **strip `/api`** before passing to backend.

First, enable annotation-based rewriting:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  namespace: default
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: default-stripprefix@kubernetescrd
spec:
  rules:
  - http:
      paths:
      - path: /api
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

Then you define a Middleware (in another YAML):

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: stripprefix
  namespace: default
spec:
  stripPrefix:
    prefixes:
      - /api
```

**Result:**  
Traefik receives `/api/todos` → removes `/api` → forwards `/todos` to backend. ✅

---

### Option 2: Update your backend app to understand `/api`
You modify your PHP application (router) to handle `/api/todos` and `/api/*` paths.

**Not recommended now** because you probably don't want to modify code just for deployment reasons.

---

# 🔥 Best Quick Fix Suggestion for You:
Apply **Option 1**: use Traefik `Middleware` to strip `/api`.  
(Keep backend unchanged.)

---

### ✍️ Small Action Plan for you
1. Create a `middleware.yaml` file for Traefik middleware.
2. Modify your `ingress.yaml` to reference the middleware.
3. Apply the YAMLs:
```bash
kubectl apply -f middleware.yaml
kubectl apply -f ingress.yaml
```


```
error: resource mapping not found for name: "stripprefix" namespace: "default" from "middleware.yaml": no matches for kind "Middleware" in version "traefik.containo.us/v1alpha1"
ensure CRDs are installed first
```

indicates that the **Traefik Custom Resource Definitions (CRDs)** for `Middleware` are **not installed** in your Kubernetes cluster.

### ✅ How to Fix It

You need to install the Traefik CRDs. Here’s how you can do it:

---

### **Option 1: Install Traefik via Helm (Recommended)**
If you're using Helm to install Traefik:

```bash
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik --namespace traefik --create-namespace
```

This will install Traefik along with the necessary CRDs.

---

### **Option 2: Install CRDs Manually**

If you want to install just the CRDs manually, run:

```bash
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
```

> Replace `v2.10` with the Traefik version you're using.

---

### Verify Middleware CRD is Installed
After installation, check CRDs:

```bash
kubectl get crds | grep traefik
```

You should see something like:

```
middlewares.traefik.containo.us
```

Once the CRD is installed, you can re-apply your `middleware.yaml`:

```bash
kubectl apply -f middleware.yaml
```

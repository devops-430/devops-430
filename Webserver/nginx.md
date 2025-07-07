
## 🔧 Prerequisites (Common for All Labs)

* Ubuntu/Debian server or VM (local or cloud)
* NGINX installed:

  ```bash
  sudo apt update
  sudo apt install nginx -y
  ```
* `curl`, `nano`, `openssl` installed

---

## **Lab 1: Hosting Static Sites**

### ✅ Real-life Scenario: Hosting a portfolio or documentation website

### 🔧 Steps:

1. Create a sample HTML file:

   ```bash
   sudo mkdir -p /var/www/mysite
   echo "<h1>Welcome to My Static Site</h1>" | sudo tee /var/www/mysite/index.html
   ```

2. Configure NGINX:

   ```bash
   sudo nano /etc/nginx/sites-available/mysite
   ```

   ```nginx
   server {
       listen 80;
       server_name localhost;

       root /var/www/mysite;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. Enable config and reload:

   ```bash
   sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Test:

   ```bash
   curl http://localhost
   ```

---

## **Lab 2: Reverse Proxy**

### ✅ Real-life Scenario: Forward traffic from NGINX to a backend app (e.g., Node.js)

1. Start a simple backend:

   ```bash
   sudo apt install nodejs npm -y
   npx http-server -p 3000 -c-1
   ```

2. Update NGINX:

   ```nginx
   server {
       listen 80;
       server_name localhost;

       location /app/ {
           proxy_pass http://localhost:3000/;
       }
   }
   ```

3. Reload and test:

   ```bash
   curl http://localhost/app/
   ```

---

## **Lab 3: Load Balancing Requests**

### ✅ Real-life Scenario: Two app servers serving requests behind one load balancer

1. Start two dummy HTTP servers:

   ```bash
   npx http-server -p 3001 -c-1 -a 127.0.0.1 --silent --content "<h1>App 1</h1>"
   npx http-server -p 3002 -c-1 -a 127.0.0.1 --silent --content "<h1>App 2</h1>"
   ```

2. Update NGINX:

   ```nginx
   upstream backend {
       server 127.0.0.1:3001;
       server 127.0.0.1:3002;
   }

   server {
       listen 80;

       location / {
           proxy_pass http://backend;
       }
   }
   ```

3. Test:

   ```bash
   curl http://localhost/
   ```

   Keep repeating the curl request to see round-robin behavior.

---

## **Lab 4: Caching, Buffering & Proxy Headers**

### ✅ Real-life Scenario: Improve performance by caching and setting correct headers

1. Update NGINX config:

   ```nginx
   server {
       listen 80;

       location / {
           proxy_pass http://localhost:3000;
           proxy_buffering on;
           proxy_cache my_cache;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }

   proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=my_cache:10m max_size=100m;
   ```

2. Reload and test headers:

   ```bash
   curl -I http://localhost/
   ```

---

## **Lab 5: Securing Traffic with TLS Termination**

### ✅ Real-life Scenario: Terminate HTTPS at NGINX while serving traffic over HTTP internally

1. Generate a self-signed cert:

   ```bash
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
   -keyout /etc/ssl/private/nginx-selfsigned.key \
   -out /etc/ssl/certs/nginx-selfsigned.crt \
   -subj "/CN=localhost"
   ```

2. Update NGINX:

   ```nginx
   server {
       listen 443 ssl;
       server_name localhost;

       ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
       ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

3. Test:

   ```bash
   curl -k https://localhost/
   ```

---

## **Lab 6: Rewriting Request and Response**

### ✅ Real-life Scenario: Change `/old-page` to `/new-page` or modify headers

1. Simple rewrite:

   ```nginx
   location /old-page {
       rewrite ^/old-page$ /new-page permanent;
   }

   location /new-page {
       return 200 'You are at the new page!';
   }
   ```

2. Modify response headers:

   ```nginx
   location / {
       proxy_pass http://localhost:3000;
       add_header X-Custom-Header "NGINX-Lab";
   }
   ```

3. Test:

   ```bash
   curl -I http://localhost/old-page
   ```


## Elaboration


---

## 🧠 Understanding HTTP Headers First

### 🔑 What is the role of headers in HTTP?

Headers are **key-value pairs** sent with HTTP requests and responses. They:

* Provide metadata (e.g. `Content-Type`, `User-Agent`)
* Control behavior (e.g. `Cache-Control`, `Set-Cookie`)
* Influence routing, authentication, caching, etc.

> Example: A browser sends `Accept: text/html` to say "I want HTML", and server replies with `Content-Type: text/html`.

---

## 1️⃣ **Sticky Session**

### ✅ Real-Life Scenario:

You're running an **e-commerce site** with 3 backend app servers. Once a user logs in and adds an item to their cart (stored in memory), they must keep hitting the same server to avoid losing session data.

### 🔧 Solution: Use sticky sessions via cookies or IP hash.

### 🔧 NGINX Example:

```nginx
upstream backend {
    ip_hash; # Sticky based on client IP
    server backend1.example.com;
    server backend2.example.com;
}
```

> 🟢 Real-world services like **Amazon** use sticky sessions for logged-in users to avoid state-loss.

---

## 2️⃣ **Weighted Load Balancing**

### ✅ Real-Life Scenario:

You’re rolling out a new version of your app on one server. You want to **gradually shift traffic**: 80% to stable, 20% to new.

### 🔧 NGINX Example:

```nginx
upstream backend {
    server app-v1.example.com weight=8;
    server app-v2.example.com weight=2;
}
```

> 🟢 Common in **canary deployments** or **A/B testing**.

---

## 3️⃣ **Rewriting Request URLs**

### ✅ Real-Life Scenario:

You’ve changed your site structure. Users visiting `/blog/123` should be sent to `/posts/123`.

### 🔧 NGINX Rewrite:

```nginx
location /blog/ {
    rewrite ^/blog/(.*)$ /posts/$1 permanent;
}
```

> 🟢 Used by blogs, e-commerce platforms after site redesigns to **preserve SEO** and old URLs.

---

## 4️⃣ **Redirection Rules**

### ✅ Real-Life Scenario:

You want all HTTP users to be redirected to HTTPS. Or you want to redirect from `oldsite.com` to `newsite.com`.

### 🔧 Redirect HTTP to HTTPS:

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

### 🔧 Redirect to new domain:

```nginx
server {
    listen 80;
    server_name oldsite.com;
    return 301 https://newsite.com$request_uri;
}
```

> 🟢 Critical for **security**, **SEO**, and **brand transitions**.

---

## 5️⃣ **Request Headers**

### ✅ Real-Life Scenario:

You need to forward client info to the backend or check `User-Agent` to deliver mobile or desktop views.

### 🔧 Forwarding headers:

```nginx
location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 🔧 Conditional behavior:

```nginx
if ($http_user_agent ~* "Mobile") {
    return 302 https://m.example.com;
}
```

> 🟢 Used in **CDNs**, **API Gateways**, or **mobile-aware websites**.

---

## 6️⃣ **Response Headers**

### ✅ Real-Life Scenario:

You want to secure the site by preventing it from being embedded (`X-Frame-Options`) or you want to enable caching.

### 🔧 Add security headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

### 🔧 Control caching:

```nginx
location /assets/ {
    expires 7d;
    add_header Cache-Control "public";
}
```

> 🟢 Used by **secure websites**, **performance-optimized apps**, **Cloudflare/CDN setups**.

---

## Summary Table

| Concept          | Use Case                           | Key Directive / Feature     |
| ---------------- | ---------------------------------- | --------------------------- |
| Sticky Session   | Preserve login/cart across servers | `ip_hash` or sticky cookies |
| Weighted Routing | Canary deployments                 | `weight` in `upstream`      |
| URL Rewrite      | Migrate site structure             | `rewrite`                   |
| Redirection      | Force HTTPS / domain migration     | `return 301 ...`            |
| Request Headers  | Pass client info to backend        | `proxy_set_header`          |
| Response Headers | Control caching, enhance security  | `add_header`                |

---

## Create Free DNS Name from below sites
Yes, there are several free domain services you can use for lab and testing purposes. Here are the best options:

---

### ✅ **1. [Freenom](https://www.freenom.com)**
- **Free TLDs**: `.tk`, `.ml`, `.ga`, `.cf`, `.gq`
- **Use case**: Great for temporary or lab environments.
- **DNS Support**: Yes, supports custom DNS records.

> 🛑 Note: Freenom has been inconsistent lately; availability can vary depending on region and domain names.

---

### ✅ **2. [DuckDNS](https://www.duckdns.org)**
- **Domain**: `yourname.duckdns.org`
- **Free**: 100% free dynamic DNS service.
- **Perfect for**: Home labs, dynamic IP setups, small EC2 instances.
- **Supports HTTPS**: Yes (can be used with Let's Encrypt).

---

### ✅ **3. [No-IP](https://www.noip.com)**
- **Domain**: `yourname.no-ip.org`, `.ddns.net`, etc.
- **Free Tier**: Yes, requires renewal every 30 days.
- **Use case**: Stable for home labs with dynamic IPs.

---

### ✅ **4. [Dynu](https://www.dynu.com)**
- **Free subdomain**: `yourname.dynu.net`
- **Features**: Dynamic DNS, custom domain support.
- **Good for**: More control and active development environments.

---

### ✅ **5. [InfinityFree (with FreeSubdomains)](https://app.infinityfree.net/domains)**
- **Domain Options**: e.g., `yourname.epizy.com`, `rf.gd`
- **More for**: Hosting + free subdomain, good for web labs.

---

### 🛠 How to use (basic flow):
1. **Register a free subdomain** (e.g., `myjenkins.duckdns.org`)
2. **Update your EC2 public IP** in the DNS settings of the provider.
3. **Point your Nginx/Apache/Jenkins to serve on that domain.**
4. **Optional:** Use [Let's Encrypt](https://letsencrypt.org) for a free SSL certificate.


Great! Since your backend (Jenkins or a web app) is running on port **8080**, and you've chosen the domain `openlabfreeci.servebeer.com`, here's how you can set up **Nginx as a reverse proxy with SSL using Let's Encrypt**.

---

## ✅ Step-by-step NGINX + SSL Setup on Ubuntu/Debian

### 🔧 1. **Install Nginx & Certbot**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

### ⚙️ 2. **Configure Nginx Reverse Proxy**
Create a new Nginx config:
```bash
sudo nano /etc/nginx/sites-available/openlabfreeci
```

Paste this:
```nginx
server {
    listen 80;
    server_name openlabfreeci.servebeer.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the config:
```bash
sudo ln -s /etc/nginx/sites-available/openlabfreeci /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

### 🔐 3. **Obtain SSL Certificate**
Make sure DNS `openlabfreeci.servebeer.com` points to your EC2 public IP.

Run:
```bash
sudo certbot --nginx -d openlabfreeci.servebeer.com
```

Follow the prompts, and Certbot will:
- Get the cert
- Update your Nginx config to use HTTPS
- Set up auto-renewal

---

### 🔁 4. **Verify HTTPS**
Visit:
```
https://openlabfreeci.servebeer.com
```
You should see your backend (running on port 8080) served securely via HTTPS.

## Adding Jenkins Build Agent
https://www.jenkins.io/blog/2022/12/27/run-jenkins-agent-as-a-service/


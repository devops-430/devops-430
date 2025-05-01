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

To set up a **Jenkins agent (node) on Ubuntu without Docker**, you can do it via **SSH connection** or **JAR-based agent**. Here's a straightforward step-by-step guide for the **SSH-based agent setup**, which is preferred and stable.

---

## ✅ Prerequisites:
- Jenkins Controller (running and accessible)
- Ubuntu machine (agent) with:
  - OpenSSH Server installed
  - Java installed (JDK 8 or later)
  - A user account (e.g., `jenkins`)
- Controller must be able to SSH into the agent

---

## 🧰 Step-by-Step Guide

### 1. **Install Java on the Agent**
```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

---

### 2. **Create a Jenkins User on the Agent**
```bash
sudo adduser jenkins
sudo usermod -aG sudo jenkins
```

---

### 3. **Set Up SSH Access from Controller to Agent**
On the Jenkins **controller** machine:

```bash
ssh-keygen -f ~/.ssh/jenkins_agent_key
```
Then copy the public key to the **agent**:

```bash
ssh-copy-id jenkins@<agent_ip>
```

Verify:
```bash
ssh jenkins@<agent_ip>
```

---

### 4. **Add the Agent in Jenkins Controller**

On Jenkins Controller:
1. Go to `Manage Jenkins` → `Manage Nodes and Clouds`
2. Click **New Node**
3. Name: `ubuntu-agent`, Type: **Permanent Agent**
4. Configure:
   - **Remote root directory**: `/home/jenkins/agent`
   - **Labels**: `ubuntu` or anything relevant
   - **Usage**: Use as much as possible
   - **Launch method**: *Launch agents via SSH*
   - **Host**: Agent IP or hostname
   - **Credentials**: Add `jenkins` SSH key credentials (Username + Private Key)
   - **Java path**: `/usr/bin/java`

Save and it should connect.

---

### 5. **Agent Directory Setup (Optional)**
If needed:
```bash
sudo mkdir -p /home/jenkins/agent
sudo chown -R jenkins:jenkins /home/jenkins/agent
```

---

### ✅ Agent is Ready!
The Jenkins agent will now be available to run jobs based on labels or general purpose.

## Add inbound connection agent

**launch the Jenkins agent from the agent machine**, connecting back to the Jenkins controller. This is called a **"Java Web Start (inbound)" agent** or "Launch agent via Java Web Start" (a.k.a. *inbound connection*).


## ✅ Steps to Launch Jenkins Agent from Agent Node (Inbound)

### 🔧 1. **Create a new node in Jenkins controller**
1. Go to Jenkins UI → **Manage Jenkins** → **Manage Nodes and Clouds**
2. Click **New Node**
3. Name it (e.g., `ubuntu-agent-2`)
4. Choose **Permanent Agent** → OK
5. Configure:
   - **Remote root directory**: `/home/jenkins2/agent`
   - **Labels**: `linux` or any label you want
   - **Usage**: Use this node as much as possible
   - **Launch method**: select **Launch agent by connecting it to the controller**

---

### 🌐 2. **Get the agent JAR and connection command**
After saving the node:

- Jenkins will show you a **"Agent is offline"** page.
- Look for the section: _“Run from agent command line”_.
- You'll see something like:

```bash
java -jar agent.jar -jnlpUrl https://your-jenkins.com/computer/ubuntu-agent-2/jenkins-agent.jnlp -secret abcdef123456... -workDir "/home/jenkins2/agent"
```

---

### 📥 3. **Download `agent.jar` on the agent node**
From the agent machine (`jenkins3` user):

```bash
mkdir -p /home/jenkins3/agent
cd /home/jenkins3/agent
wget https://<your-jenkins-url>/jnlpJars/agent.jar
```

Replace `<your-jenkins-url>` with your actual Jenkins base URL (e.g., `http://controller-ip:8080` or your public domain).

---

### 🚀 4. **Run the agent**
Run the command you got earlier from Jenkins UI:

```bash
java -jar agent.jar -jnlpUrl https://<your-jenkins-url>/computer/ubuntu-agent-2/jenkins-agent.jnlp -secret <secret> -workDir "/home/jenkins2/agent"
```

This will connect the agent to Jenkins and you'll see the node come online in the UI.

---

### 🔄 5. **(Optional) Set it to run at boot**
You can add it to a `systemd` service or `rc.local` depending on how persistent you want it.

Error
```bash
org.jenkinsci.remoting.engine.WorkDirManager setupLogging
INFO: Both error and output logs will be printed to /home/jenkins3/agent/remoting
May 01, 2025 2:46:13 PM hudson.remoting.Launcher createEngine
```

The error message `Failed to connect: Handshake error.` when launching the Jenkins agent with the `-webSocket` option typically points to **one of the following problems** between the agent and the controller:

---

### ✅ Quick Checklist to Resolve WebSocket Handshake Errors

#### 1. **Ensure Jenkins controller URL uses HTTPS with a valid certificate**
- You are using:
  ```
  https://openlabfreeci.servebeer.com/
  ```
- Make sure:
  - The certificate is **trusted** (not self-signed or invalid).
  - It’s **not redirecting HTTP → HTTPS** improperly.

✅ **Fix**: Open the URL in a browser and check for any SSL/TLS errors.

---

#### 2. **Check if WebSocket support is enabled on the controller**
- In Jenkins, go to:
  ```
  Manage Jenkins → Global Security Configuration
  ```
- Scroll down to **Agent protocols** and make sure:
  - ✅ `JNLP4-connect` and ✅ `WebSocket` are **enabled**.

---

#### 3. **Firewall / Reverse Proxy (e.g., Nginx/Apache) issues**
If you're behind a reverse proxy:
- Ensure it's configured to support WebSocket connections:
  - Nginx:
    ```nginx
    location / {
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      ...
    }
    ```
  - Apache:
    ```apache
    ProxyPass / ws://localhost:8080/
    ProxyPassReverse / ws://localhost:8080/
    ```

---

#### 4. **Use alternative connection method (classic JNLP)**
If WebSocket keeps failing, try **without** `-webSocket`:

```bash
java -jar agent.jar \
  -url https://openlabfreeci.servebeer.com/ \
  -secret 36521ce4a8759e46dca4faea4a01fe70b731c6f5f0b95c00d02e6a800ab8c612 \
  -name "ubuntu-node-2" \
  -workDir "/home/jenkins3/agent"
```

This uses the default **JNLP4-connect**, which may work better if WebSocket support is flaky or misconfigured.

---

To run the Jenkins agent as a **user-level systemd service** (without requiring `sudo` or root access), follow these steps:

---

### ✅ 1. Create the systemd user service file

Create a service under your user’s systemd directory:

```bash
mkdir -p ~/.config/systemd/user
nano ~/.config/systemd/user/jenkins-agent.service
```

Paste the following into the file (customize as needed):

```ini
[Unit]
Description=Jenkins Agent
After=network.target

[Service]
ExecStart=/usr/bin/java -jar /home/jenkins3/agent/agent.jar -url https://openlabfreeci.servebeer.com/ -secret 36521ce4a8759e46dca4faea4a01fe70b731c6f5f0b95c00d02e6a800ab8c612 -name "ubuntu-node-2" -webSocket -workDir "/home/jenkins3/agent"
WorkingDirectory=/home/jenkins3/agent
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

---

### ✅ 2. Enable user lingering (optional if agent must run at boot)

If you want the agent to start on boot **without login**, enable user lingering:

```bash
sudo loginctl enable-linger jenkins3
```

---

### ✅ 3. Reload and start the service (as your user)

```bash
systemctl --user daemon-reload
systemctl --user enable jenkins-agent
systemctl --user start jenkins-agent
```

---

### ✅ 4. Check status or logs

```bash
systemctl --user status jenkins-agent
journalctl --user -u jenkins-agent -f
```

---

### ⚠️ Important

- You must run these commands as the `jenkins3` user.
- Ensure `agent.jar` exists at the specified path.
- `~/.config/systemd/user` is for **per-user services**.

Error
```bash
systemctl --user daemon-reload
systemctl --user enable jenkins-agent
systemctl --user start jenkins-agent
Failed to connect to bus: No medium found
Failed to connect to bus: No medium found
Failed to connect to bus: No medium found
```
The error `Failed to connect to bus: No medium found` means **your user session doesn't have access to the `systemd --user` bus**, likely because you're running in a **non-interactive session** like SSH without a proper login shell or DBus session.

---

### 🔧 Solution Options:

#### ✅ Option 1: Use `loginctl enable-linger` (recommended for headless servers)
Enable **lingering**, which lets your user run user-level systemd services **even without an active login session**:

```bash
sudo loginctl enable-linger jenkins3
```

Then log out and log back in (or reboot), and try again:

```bash
systemctl --user daemon-reload
systemctl --user start jenkins-agent
```

> If you want it to auto-start on login:
```bash
systemctl --user enable jenkins-agent
```

---

#### ✅ Option 2: Use `dbus-launch` (for interactive workaround)

If you don’t want to enable lingering and just want it to run in the current session, try:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u)
export DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus"
```

If the bus still doesn't exist, start one manually:

```bash
eval $(dbus-launch --sh-syntax)
systemctl --user daemon-reload
systemctl --user start jenkins-agent
```

---

### 🧪 Test if the user bus exists:
```bash
ls /run/user/$(id -u)/bus
```
If the file doesn’t exist, no user bus is active — use `loginctl enable-linger`.


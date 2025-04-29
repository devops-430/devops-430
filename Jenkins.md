
# Jenkins Sandbox Installation Guide

## Step 1: Create an Instance and Log In

First, create a virtual machine or cloud instance (e.g., EC2, DigitalOcean droplet) and SSH into it:

```bash
mkdir jenkins
cd jenkins
```

## Step 2: Add Docker Compose File

Create a file named `docker-compose.yaml` and add the following content:

```yaml
# Jenkins Sandbox
version: "3"
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins_sandbox
    privileged: true
    user: root
    ports:
      - 8080:8080
      - 50000:50000
    volumes:
      - /home/${USER_NAME}/jenkins_sandbox_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock

  agent:
    image: jenkins/ssh-agent:jdk11
    container_name: jenkins_sandbox_agent
    privileged: true
    user: root
    expose:
      - 22
    environment:
      - JENKINS_AGENT_SSH_PUBKEY=${JENKINS_AGENT_SSH_PUBLIC_KEY}
```

## Step 3: Create `.env` File

Create an `.env` file with your username and SSH public key:

```bash
cat > .env
```

Paste the following content:

```env
USER_NAME=cloud_user_p_569321cb
JENKINS_AGENT_SSH_PUBLIC_KEY=
```

> ⚠️ Replace `cloud_user_p_569321cb` with your actual username, and add your SSH public key after `=`.

## Step 4: Start Jenkins

Use `docker-compose` to pull images and start the containers:

```bash
docker-compose up -d
```

You can verify if containers are running:

```bash
docker ps
```

## Step 5: Access Jenkins UI

1. Open a browser and go to:  
   **http://<your-server-ip>:8080**

2. Find the initial admin password:

   ```bash
   sudo cat /home/${USER_NAME}/jenkins_sandbox_home/secrets/initialAdminPassword
   ```

3. Paste it in the Jenkins setup page.

4. Follow the Jenkins setup wizard:
   - Install suggested plugins
   - Create your admin user
   - Start using Jenkins

---

✅ **Jenkins is now up and running in a Docker-based sandbox!**


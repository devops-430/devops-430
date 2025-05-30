# PHP 3-Tier Application Ansible Role

This Ansible role deploys a PHP 3-tier application using Docker containers. The application consists of:
- Frontend (Apache HTTP Server)
- Backend (PHP API)
- Database (MySQL)

## Requirements

- Ansible 2.9 or higher
- Target system with Ubuntu/Debian-based distribution
- Python 3.x
- Internet connection for downloading Docker images

## Role Variables

The following variables can be customized in your playbook:

```yaml
# Installation path
app_install_path: /opt/php-3tier

# Docker Compose version
docker_compose_version: '3'

# Database configuration
db_name: todo_app
db_user: todo_admin
db_password: password

# Port configurations
frontend_port: 3000
backend_port: 5000
```

## Example Playbook

```yaml
- hosts: webservers
  roles:
    - role: php_3tier
      vars:
        app_install_path: /opt/myapp
        db_password: my_secure_password
        frontend_port: 8080
        backend_port: 8081
```

## Usage

1. Include the role in your playbook:
```yaml
- hosts: your_target_hosts
  roles:
    - php_3tier
```

2. Run the playbook:
```bash
ansible-playbook your_playbook.yml
```

## What the Role Does

1. Installs required packages (Docker, Docker Compose, Python pip)
2. Ensures Docker service is running
3. Creates application directory
4. Copies application files
5. Deploys the application using Docker Compose
6. Waits for services to be ready

## Accessing the Application

After deployment, the application will be accessible at:
- Frontend: http://your_server:3000
- Backend API: http://your_server:5000

## Notes

- The role assumes the target system is running a Debian-based distribution
- Make sure to secure the database password in production environments
- The role requires root/sudo privileges to install packages and manage Docker 